/**
 * AI Travel Planner service layer.
 * Orchestrates prompt construction, provider calls, retries, and response formatting.
 */

import aiConfig, {
  AI_PROVIDERS,
  assertProviderConfigured,
  getActiveProviderConfig,
} from '../config/aiConfig.js';
import { buildTravelPlanPrompts } from '../utils/promptBuilder.js';
import {
  formatTravelPlanResponse,
  TravelPlanFormatError,
} from '../utils/responseFormatter.js';

/** @typedef {import('./aiService.types.js').TravelPlanRequest} TravelPlanRequest */
/** @typedef {import('./aiService.types.js').TravelPlanResponse} TravelPlanResponse */

export class AiServiceError extends Error {
  /**
   * @param {string} message
   * @param {{ statusCode?: number, code?: string, cause?: unknown, retryable?: boolean }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'AI_SERVICE_ERROR';
    this.cause = options.cause;
    this.retryable = options.retryable ?? false;
  }
}

export class AiValidationError extends AiServiceError {
  /**
   * @param {string} message
   * @param {{ details?: string[] }} [options]
   */
  constructor(message, options = {}) {
    super(message, { statusCode: 400, code: 'AI_VALIDATION_ERROR', retryable: false });
    this.name = 'AiValidationError';
    this.details = options.details || [];
  }
}

/**
 * Structured logger — swap implementation for Winston/Pino in production.
 * @param {'info'|'warn'|'error'} level
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
const log = (level, message, meta = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    service: 'aiService',
    level,
    message,
    ...meta,
  };

  const output = JSON.stringify(payload);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.info(output);
  }
};

/**
 * Returns a promise that rejects after the configured timeout.
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<never>}
 */
const createTimeoutPromise = (ms, signal) =>
  new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(
        new AiServiceError(`AI request timed out after ${ms}ms.`, {
          code: 'AI_TIMEOUT',
          retryable: true,
        })
      );
    }, ms);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
        },
        { once: true }
      );
    }
  });

/**
 * Sleep helper for retry backoff.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determines whether an error is transient and worth retrying.
 * @param {unknown} error
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  if (error instanceof AiValidationError || error instanceof TravelPlanFormatError) {
    return false;
  }

  if (error instanceof AiServiceError) {
    return Boolean(error.retryable);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('fetch failed') ||
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('500')
    );
  }

  return false;
};

/**
 * Computes exponential backoff delay with jitter.
 * @param {number} attempt - 1-based attempt number
 * @returns {number}
 */
const getBackoffDelay = (attempt) => {
  const { initialDelayMs, maxDelayMs, backoffMultiplier } = aiConfig.retry;
  const exponential = initialDelayMs * backoffMultiplier ** (attempt - 1);
  const capped = Math.min(exponential, maxDelayMs);
  const jitter = Math.floor(Math.random() * 250);
  return capped + jitter;
};

/**
 * Validates incoming travel plan request fields.
 * @param {TravelPlanRequest} input
 * @throws {AiValidationError}
 */
export const validateTravelPlanRequest = (input) => {
  const errors = [];
  const { validation } = aiConfig;

  if (!input || typeof input !== 'object') {
    throw new AiValidationError('Request body must be a valid JSON object.');
  }

  const destination =
    typeof input.destination === 'string' ? input.destination.trim() : '';

  if (
    destination.length < validation.destinationMinLength ||
    destination.length > validation.destinationMaxLength
  ) {
    errors.push(
      `destination must be between ${validation.destinationMinLength} and ${validation.destinationMaxLength} characters.`
    );
  }

  const duration = Number(input.duration);
  if (
    !Number.isInteger(duration) ||
    duration < validation.durationMinDays ||
    duration > validation.durationMaxDays
  ) {
    errors.push(
      `duration must be an integer between ${validation.durationMinDays} and ${validation.durationMaxDays}.`
    );
  }

  if (input.budget != null) {
    const budget = Number(input.budget);
    if (!Number.isFinite(budget) || budget < validation.budgetMin || budget > validation.budgetMax) {
      errors.push(
        `budget must be a number between ${validation.budgetMin} and ${validation.budgetMax}.`
      );
    }
  }

  if (input.interests != null) {
    const interestCount = Array.isArray(input.interests)
      ? input.interests.length
      : String(input.interests).split(',').filter(Boolean).length;

    if (interestCount === 0) {
      errors.push('interests must contain at least one item.');
    } else if (interestCount > validation.interestsMaxItems) {
      errors.push(`interests cannot exceed ${validation.interestsMaxItems} items.`);
    }
  } else {
    errors.push('interests is required.');
  }

  if (input.travelers == null || String(input.travelers).trim() === '') {
    errors.push('travelers is required.');
  }

  if (input.travelStyle != null) {
    const style = String(input.travelStyle);
    if (style.length > validation.travelStyleMaxLength) {
      errors.push(`travelStyle cannot exceed ${validation.travelStyleMaxLength} characters.`);
    }
  }

  if (input.season != null) {
    const season = String(input.season);
    if (season.length > validation.seasonMaxLength) {
      errors.push(`season cannot exceed ${validation.seasonMaxLength} characters.`);
    }
  }

  if (input.startingLocation != null) {
    const startingLocation = String(input.startingLocation);
    if (startingLocation.length > validation.startingLocationMaxLength) {
      errors.push(
        `startingLocation cannot exceed ${validation.startingLocationMaxLength} characters.`
      );
    }
  }

  if (errors.length > 0) {
    throw new AiValidationError('Invalid travel plan request.', { details: errors });
  }

  return {
    destination,
    duration,
    budget: input.budget != null ? Number(input.budget) : undefined,
    interests: input.interests,
    travelers: input.travelers,
    travelStyle: input.travelStyle?.trim() || undefined,
    season: input.season?.trim() || undefined,
    startingLocation: input.startingLocation?.trim() || undefined,
  };
};

/**
 * Calls OpenAI Chat Completions API with JSON response mode.
 * @param {{ systemPrompt: string, userPrompt: string, signal: AbortSignal }} params
 * @returns {Promise<string>}
 */
const callOpenAI = async ({ systemPrompt, userPrompt, signal }) => {
  const { config } = getActiveProviderConfig();

  const body = {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  const baseURL = config.baseURL || 'https://api.openai.com/v1';
  const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  const responseText = await response.text();
  let payload;

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new AiServiceError('OpenAI returned a non-JSON response.', {
      statusCode: response.status,
      code: 'OPENAI_INVALID_RESPONSE',
      retryable: response.status >= 500,
    });
  }

  if (!response.ok) {
    const providerMessage =
      payload?.error?.message || `OpenAI request failed with status ${response.status}.`;

    throw new AiServiceError(providerMessage, {
      statusCode: response.status,
      code: response.status === 429 ? 'OPENAI_RATE_LIMIT' : 'OPENAI_API_ERROR',
      retryable: response.status === 429 || response.status >= 500,
    });
  }

  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new AiServiceError('OpenAI returned an empty completion.', {
      code: 'OPENAI_EMPTY_COMPLETION',
      retryable: true,
    });
  }

  return content;
};

/**
 * Calls Google Gemini generateContent API with JSON response mode.
 * @param {{ systemPrompt: string, userPrompt: string, signal: AbortSignal }} params
 * @returns {Promise<string>}
 */
const callGemini = async ({ systemPrompt, userPrompt, signal }) => {
  const { config } = getActiveProviderConfig();
  const model = encodeURIComponent(config.model);

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  const responseText = await response.text();
  let payload;

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new AiServiceError('Gemini returned a non-JSON response.', {
      statusCode: response.status,
      code: 'GEMINI_INVALID_RESPONSE',
      retryable: response.status >= 500,
    });
  }

  if (!response.ok) {
    const providerMessage =
      payload?.error?.message || `Gemini request failed with status ${response.status}.`;

    throw new AiServiceError(providerMessage, {
      statusCode: response.status,
      code: response.status === 429 ? 'GEMINI_RATE_LIMIT' : 'GEMINI_API_ERROR',
      retryable: response.status === 429 || response.status >= 500,
    });
  }

  const parts = payload?.candidates?.[0]?.content?.parts;
  const textPart = Array.isArray(parts)
    ? parts.map((part) => part?.text).filter(Boolean).join('')
    : '';

  if (!textPart.trim()) {
    const blockReason = payload?.candidates?.[0]?.finishReason;
    throw new AiServiceError(
      `Gemini returned an empty completion${blockReason ? ` (${blockReason})` : ''}.`,
      {
        code: 'GEMINI_EMPTY_COMPLETION',
        retryable: blockReason === 'MAX_TOKENS',
      }
    );
  }

  return textPart;
};

/**
 * Dispatches the request to the configured AI provider.
 * @param {{ systemPrompt: string, userPrompt: string, signal: AbortSignal }} params
 * @returns {Promise<string>}
 */
const callProvider = async (params) => {
  const { provider } = getActiveProviderConfig();

  switch (provider) {
    case AI_PROVIDERS.GEMINI:
      return callGemini(params);
    case AI_PROVIDERS.OPENAI:
    default:
      return callOpenAI(params);
  }
};

/**
 * Executes a single provider call with timeout enforcement.
 * @param {{ systemPrompt: string, userPrompt: string }} prompts
 * @returns {Promise<string>}
 */
const executeWithTimeout = async (prompts) => {
  const controller = new AbortController();

  try {
    const result = await Promise.race([
      callProvider({ ...prompts, signal: controller.signal }),
      createTimeoutPromise(aiConfig.requestTimeoutMs, controller.signal),
    ]);

    return result;
  } finally {
    controller.abort();
  }
};

/**
 * Executes provider call with exponential backoff retry for transient failures.
 * @param {{ systemPrompt: string, userPrompt: string }} prompts
 * @returns {Promise<string>}
 */
const executeWithRetry = async (prompts) => {
  const { maxAttempts } = aiConfig.retry;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      log('info', 'AI provider request started', {
        attempt,
        maxAttempts,
        provider: getActiveProviderConfig().provider,
      });

      const rawResponse = await executeWithTimeout(prompts);

      log('info', 'AI provider request succeeded', { attempt });
      return rawResponse;
    } catch (error) {
      lastError = error;

      const retryable = isRetryableError(error);
      const isLastAttempt = attempt >= maxAttempts;

      log(retryable && !isLastAttempt ? 'warn' : 'error', 'AI provider request failed', {
        attempt,
        maxAttempts,
        retryable,
        error: error instanceof Error ? error.message : String(error),
        code: error instanceof AiServiceError ? error.code : undefined,
      });

      if (!retryable || isLastAttempt) {
        break;
      }

      const delayMs = getBackoffDelay(attempt);
      log('info', 'Retrying AI provider request', { attempt: attempt + 1, delayMs });
      await sleep(delayMs);
    }
  }

  if (lastError instanceof AiServiceError) {
    throw lastError;
  }

  throw new AiServiceError('AI provider request failed after retries.', {
    cause: lastError,
    retryable: false,
  });
};

/**
 * Generates a complete travel plan from user input.
 * Single entry point for controllers/routes.
 *
 * @param {TravelPlanRequest} input - Raw request payload
 * @returns {Promise<TravelPlanResponse>}
 */
export const generateTravelPlan = async (input) => {
  assertProviderConfigured();

  const validatedInput = validateTravelPlanRequest(input);
  const prompts = buildTravelPlanPrompts(validatedInput);

  log('info', 'Generating travel plan', {
    destination: validatedInput.destination,
    duration: validatedInput.duration,
    provider: getActiveProviderConfig().provider,
  });

  try {
    const rawResponse = await executeWithRetry(prompts);
    const formatted = formatTravelPlanResponse(rawResponse);

    log('info', 'Travel plan generated successfully', {
      destination: validatedInput.destination,
      days: formatted.dailyPlan.length,
    });

    return formatted;
  } catch (error) {
    if (error instanceof AiValidationError || error instanceof TravelPlanFormatError) {
      log('error', 'Travel plan generation failed — non-retryable formatting/validation error', {
        error: error.message,
        details: error.details,
      });
      throw error;
    }

    if (error instanceof AiServiceError) {
      log('error', 'Travel plan generation failed — provider error', {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
      throw error;
    }

    log('error', 'Travel plan generation failed — unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });

    throw new AiServiceError('Unexpected error while generating travel plan.', {
      cause: error,
      retryable: false,
    });
  }
};

export default {
  generateTravelPlan,
  validateTravelPlanRequest,
  AiServiceError,
  AiValidationError,
};
