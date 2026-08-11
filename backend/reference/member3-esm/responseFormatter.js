/**
 * Response parsing, repair, and normalization for AI travel plan output.
 * Ensures downstream consumers always receive a predictable object shape.
 */

/** @typedef {import('../services/aiService.types.js').TravelPlanResponse} TravelPlanResponse */

export class TravelPlanFormatError extends Error {
  /**
   * @param {string} message
   * @param {{ cause?: unknown, rawResponse?: string, details?: string[] }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'TravelPlanFormatError';
    this.cause = options.cause;
    this.rawResponse = options.rawResponse;
    this.details = options.details || [];
  }
}

/**
 * Strips Markdown code fences and leading/trailing noise from model output.
 * @param {string} raw
 * @returns {string}
 */
export const stripMarkdownFences = (raw) => {
  if (typeof raw !== 'string') {
    return '';
  }

  let cleaned = raw.trim();

  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenceMatch = cleaned.match(/^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Remove leading "json" label sometimes emitted without fences
  if (/^json\s*\n/i.test(cleaned)) {
    cleaned = cleaned.replace(/^json\s*\n/i, '').trim();
  }

  return cleaned;
};

/**
 * Attempts to extract the first JSON object from a mixed response.
 * @param {string} raw
 * @returns {string | null}
 */
export const extractJsonObject = (raw) => {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return raw.slice(start, end + 1);
};

/**
 * Fixes common JSON formatting issues from LLM output.
 * @param {string} jsonString
 * @returns {string}
 */
export const repairJsonString = (jsonString) => {
  let repaired = jsonString;

  // Remove trailing commas before } or ]
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // Replace smart quotes with standard quotes
  repaired = repaired.replace(/[\u201C\u201D]/g, '"');
  repaired = repaired.replace(/[\u2018\u2019]/g, "'");

  // Remove BOM and zero-width characters
  repaired = repaired.replace(/^\uFEFF/, '');
  repaired = repaired.replace(/[\u200B-\u200D\uFEFF]/g, '');

  return repaired.trim();
};

/**
 * Safely parses JSON with repair attempts.
 * @param {string} raw
 * @returns {unknown}
 */
export const parseJsonSafely = (raw) => {
  const cleaned = stripMarkdownFences(raw);
  const candidates = [cleaned, extractJsonObject(cleaned)].filter(Boolean);

  const errors = [];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      errors.push(error);

      try {
        const repaired = repairJsonString(candidate);
        return JSON.parse(repaired);
      } catch (repairError) {
        errors.push(repairError);
      }
    }
  }

  throw new TravelPlanFormatError('Failed to parse AI response as JSON.', {
    cause: errors[errors.length - 1],
    rawResponse: raw,
    details: errors.map((e) => (e instanceof Error ? e.message : String(e))),
  });
};

/**
 * Coerces an unknown value to a non-null object.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
const toObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? /** @type {Record<string, unknown>} */ (value)
    : {};

/**
 * Coerces an unknown value to a string array.
 * @param {unknown} value
 * @returns {string[]}
 */
const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
    .filter(Boolean);
};

/**
 * Coerces an unknown value to a string.
 * @param {unknown} value
 * @param {string} [fallback='']
 * @returns {string}
 */
const toString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

/**
 * Normalizes a single time block (morning/afternoon/evening).
 * @param {unknown} block
 * @returns {Record<string, unknown>}
 */
const normalizeTimeBlock = (block) => {
  const obj = toObject(block);

  return {
    activities: toStringArray(obj.activities),
    location: toString(obj.location, 'Information may vary.'),
    estimatedDuration: toString(obj.estimatedDuration, 'Information may vary.'),
    estimatedCost: toString(obj.estimatedCost, 'Information may vary.'),
    transportation: toString(obj.transportation, 'Information may vary.'),
    foodRecommendation: toString(obj.foodRecommendation, 'Information may vary.'),
    travelTips: toStringArray(obj.travelTips),
  };
};

/**
 * Normalizes daily plan entries.
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const normalizeDailyPlan = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((day, index) => {
    const obj = toObject(day);
    const dayNumber =
      typeof obj.day === 'number' && Number.isFinite(obj.day) ? obj.day : index + 1;

    return {
      day: dayNumber,
      date: toString(obj.date, `Day ${dayNumber}`),
      theme: toString(obj.theme, 'Information may vary.'),
      morning: normalizeTimeBlock(obj.morning),
      afternoon: normalizeTimeBlock(obj.afternoon),
      evening: normalizeTimeBlock(obj.evening),
      dailyEstimatedCost: toString(obj.dailyEstimatedCost, 'Information may vary.'),
      dailyTransportationSummary: toString(
        obj.dailyTransportationSummary,
        'Information may vary.'
      ),
      dailyTravelSummary: toString(obj.dailyTravelSummary, 'Information may vary.'),
    };
  });
};

/**
 * Normalizes budget allocation object.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
const normalizeBudgetAllocation = (value) => {
  const obj = toObject(value);
  const breakdown = toObject(obj.breakdown);

  return {
    totalBudget: toString(obj.totalBudget, 'Information may vary.'),
    currency: toString(obj.currency, 'Information may vary.'),
    breakdown: {
      accommodation: toString(breakdown.accommodation, 'Information may vary.'),
      food: toString(breakdown.food, 'Information may vary.'),
      transportation: toString(breakdown.transportation, 'Information may vary.'),
      activities: toString(breakdown.activities, 'Information may vary.'),
      miscellaneous: toString(breakdown.miscellaneous, 'Information may vary.'),
    },
    moneySavingTips: toStringArray(obj.moneySavingTips),
    freeAttractions: toStringArray(obj.freeAttractions),
  };
};

/**
 * Normalizes packing list entries.
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const normalizePackingList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    const obj = toObject(entry);
    return {
      category: toString(obj.category, 'General'),
      items: toStringArray(obj.items),
    };
  });
};

/**
 * Normalizes transportation entries.
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const normalizeTransportation = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    const obj = toObject(entry);
    return {
      type: toString(obj.type, 'Information may vary.'),
      description: toString(obj.description, 'Information may vary.'),
      estimatedCost: toString(obj.estimatedCost, 'Information may vary.'),
      tips: toStringArray(obj.tips),
    };
  });
};

/**
 * Normalizes food recommendation entries.
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const normalizeFoods = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    const obj = toObject(entry);
    return {
      name: toString(obj.name, 'Information may vary.'),
      description: toString(obj.description, 'Information may vary.'),
      whereToTry: toString(obj.whereToTry, 'Information may vary.'),
      priceRange: toString(obj.priceRange, 'Information may vary.'),
      dietaryNotes: toString(obj.dietaryNotes, 'Information may vary.'),
    };
  });
};

/**
 * Normalizes emergency info block.
 * @param {unknown} value
 * @returns {Record<string, string>}
 */
const normalizeEmergencyInfo = (value) => {
  const obj = toObject(value);

  return {
    generalEmergency: toString(obj.generalEmergency, 'Information may vary.'),
    police: toString(obj.police, 'Information may vary.'),
    ambulance: toString(obj.ambulance, 'Information may vary.'),
    touristHelpline: toString(obj.touristHelpline, 'Information may vary.'),
    embassyNote: toString(
      obj.embassyNote,
      'Contact your embassy or consulate before travel. Information may vary.'
    ),
    disclaimer: toString(
      obj.disclaimer,
      'Emergency numbers and services may vary. Verify locally upon arrival.'
    ),
  };
};

/**
 * Normalizes travel checklist entries.
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const normalizeTravelChecklist = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const validPriorities = new Set(['high', 'medium', 'low']);

  return value.map((entry) => {
    const obj = toObject(entry);
    const priority = toString(obj.priority, 'medium').toLowerCase();

    return {
      task: toString(obj.task, 'Information may vary.'),
      category: toString(obj.category, 'General'),
      priority: validPriorities.has(priority) ? priority : 'medium',
    };
  });
};

/**
 * Normalizes trip summary object.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
const normalizeTripSummary = (value) => {
  const obj = toObject(value);

  return {
    destination: toString(obj.destination, 'Information may vary.'),
    duration:
      typeof obj.duration === 'number' && Number.isFinite(obj.duration)
        ? obj.duration
        : 0,
    overview: toString(obj.overview, 'Information may vary.'),
    highlights: toStringArray(obj.highlights),
    paceRecommendation: toString(obj.paceRecommendation, 'Information may vary.'),
    dailyTravelSummary: toStringArray(obj.dailyTravelSummary),
  };
};

/**
 * Validates and normalizes parsed AI output into the canonical response shape.
 * Missing fields become empty arrays/objects instead of causing crashes.
 * @param {unknown} parsed
 * @returns {TravelPlanResponse}
 */
export const normalizeTravelPlanResponse = (parsed) => {
  const root = toObject(parsed);

  return {
    tripSummary: normalizeTripSummary(root.tripSummary),
    dailyPlan: normalizeDailyPlan(root.dailyPlan),
    budgetAllocation: normalizeBudgetAllocation(root.budgetAllocation),
    packingList: normalizePackingList(root.packingList),
    transportation: normalizeTransportation(root.transportation),
    foods: normalizeFoods(root.foods),
    safetyTips: toStringArray(root.safetyTips),
    localEtiquette: toStringArray(root.localEtiquette),
    bestTimeToVisit: toString(root.bestTimeToVisit, 'Information may vary.'),
    emergencyInfo: normalizeEmergencyInfo(root.emergencyInfo),
    travelChecklist: normalizeTravelChecklist(root.travelChecklist),
  };
};

/**
 * Parses raw AI text, validates structure, and returns normalized travel plan.
 * @param {string} rawResponse
 * @returns {TravelPlanResponse}
 */
export const formatTravelPlanResponse = (rawResponse) => {
  if (typeof rawResponse !== 'string' || !rawResponse.trim()) {
    throw new TravelPlanFormatError('AI returned an empty response.', {
      rawResponse: rawResponse ?? '',
    });
  }

  const parsed = parseJsonSafely(rawResponse);
  const normalized = normalizeTravelPlanResponse(parsed);

  if (!normalized.dailyPlan.length) {
    throw new TravelPlanFormatError(
      'AI response is missing dailyPlan entries after normalization.',
      { rawResponse }
    );
  }

  return normalized;
};

export default formatTravelPlanResponse;
