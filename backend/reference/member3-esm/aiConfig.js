/**
 * AI module configuration.
 * Centralizes provider settings, model selection, and operational limits.
 * All secrets are loaded from environment variables — never hardcode API keys.
 */

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseFloatEnv = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Supported AI providers */
export const AI_PROVIDERS = Object.freeze({
  OPENAI: 'openai',
  GEMINI: 'gemini',
});

const provider = (process.env.AI_PROVIDER || AI_PROVIDERS.OPENAI).toLowerCase();

const aiConfig = Object.freeze({
  provider,

  openai: Object.freeze({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    maxTokens: parsePositiveInt(process.env.OPENAI_MAX_TOKENS, 8192),
    temperature: parseFloatEnv(process.env.OPENAI_TEMPERATURE, 0.4),
  }),

  gemini: Object.freeze({
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    maxOutputTokens: parsePositiveInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 8192),
    temperature: parseFloatEnv(process.env.GEMINI_TEMPERATURE, 0.4),
  }),

  /** Hard timeout for a single AI request (milliseconds) */
  requestTimeoutMs: parsePositiveInt(process.env.AI_REQUEST_TIMEOUT_MS, 30_000),

  /** Retry policy for transient failures (429, 5xx, network errors) */
  retry: Object.freeze({
    maxAttempts: parsePositiveInt(process.env.AI_RETRY_MAX_ATTEMPTS, 3),
    initialDelayMs: parsePositiveInt(process.env.AI_RETRY_INITIAL_DELAY_MS, 1_000),
    maxDelayMs: parsePositiveInt(process.env.AI_RETRY_MAX_DELAY_MS, 8_000),
    backoffMultiplier: parseFloatEnv(process.env.AI_RETRY_BACKOFF_MULTIPLIER, 2),
  }),

  /** Minimum/maximum bounds for user input validation */
  validation: Object.freeze({
    destinationMinLength: 2,
    destinationMaxLength: 120,
    durationMinDays: 1,
    durationMaxDays: 30,
    budgetMin: 0,
    budgetMax: 10_000_000,
    interestsMaxItems: 20,
    travelersMin: 1,
    travelersMax: 20,
    travelStyleMaxLength: 50,
    seasonMaxLength: 50,
    startingLocationMaxLength: 120,
  }),
});

/**
 * Returns the active provider configuration block.
 * @returns {{ provider: string, config: object }}
 */
export const getActiveProviderConfig = () => {
  switch (aiConfig.provider) {
    case AI_PROVIDERS.GEMINI:
      return { provider: AI_PROVIDERS.GEMINI, config: aiConfig.gemini };
    case AI_PROVIDERS.OPENAI:
    default:
      return { provider: AI_PROVIDERS.OPENAI, config: aiConfig.openai };
  }
};

/**
 * Validates that required credentials exist for the configured provider.
 * @throws {Error} When API key is missing
 */
export const assertProviderConfigured = () => {
  const { provider: activeProvider, config } = getActiveProviderConfig();

  if (!config.apiKey) {
    const envVar =
      activeProvider === AI_PROVIDERS.GEMINI ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
    throw new Error(
      `AI provider "${activeProvider}" is not configured. Set ${envVar} in your environment.`
    );
  }
};

export default aiConfig;
