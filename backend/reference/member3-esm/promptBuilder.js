/**
 * Prompt engineering layer for the AI Travel Planner.
 * Constructs system and user prompts that enforce structured JSON output,
 * anti-hallucination guardrails, and context-aware personalization.
 */

/** Canonical JSON schema the model must populate */
export const TRAVEL_PLAN_JSON_SCHEMA = Object.freeze({
  tripSummary: {
    destination: 'string',
    duration: 'number',
    overview: 'string',
    highlights: ['string'],
    paceRecommendation: 'string',
    dailyTravelSummary: ['string — one sentence per day summarizing the day\'s theme and flow'],
  },
  dailyPlan: [
    {
      day: 'number',
      date: 'string (optional, e.g. Day 1)',
      theme: 'string',
      morning: {
        activities: ['string'],
        location: 'string',
        estimatedDuration: 'string',
        estimatedCost: 'string',
        transportation: 'string',
        foodRecommendation: 'string',
        travelTips: ['string'],
      },
      afternoon: '{ same structure as morning }',
      evening: '{ same structure as morning }',
      dailyEstimatedCost: 'string',
      dailyTransportationSummary: 'string',
      dailyTravelSummary: 'string',
    },
  ],
  budgetAllocation: {
    totalBudget: 'string',
    currency: 'string',
    breakdown: {
      accommodation: 'string',
      food: 'string',
      transportation: 'string',
      activities: 'string',
      miscellaneous: 'string',
    },
    moneySavingTips: ['string'],
    freeAttractions: ['string — include when budget is low or travel style is backpacker'],
  },
  packingList: [
    {
      category: 'string',
      items: ['string'],
    },
  ],
  transportation: [
    {
      type: 'string',
      description: 'string',
      estimatedCost: 'string',
      tips: ['string'],
    },
  ],
  foods: [
    {
      name: 'string',
      description: 'string',
      whereToTry: 'string',
      priceRange: 'string',
      dietaryNotes: 'string',
    },
  ],
  safetyTips: ['string'],
  localEtiquette: ['string'],
  bestTimeToVisit: 'string',
  emergencyInfo: {
    generalEmergency: 'string',
    police: 'string',
    ambulance: 'string',
    touristHelpline: 'string',
    embassyNote: 'string',
    disclaimer: 'string — must note that numbers may vary and user should verify locally',
  },
  travelChecklist: [
    {
      task: 'string',
      category: 'string',
      priority: 'high | medium | low',
    },
  ],
});

const LOW_BUDGET_THRESHOLD = 1500;
const FAMILY_TRAVELER_KEYWORDS = ['family', 'kids', 'children', 'child', ' toddler', 'baby'];
const SOLO_TRAVELER_KEYWORDS = ['solo', 'alone', 'single'];
const HONEYMOON_KEYWORDS = ['honeymoon', 'romantic', 'couple', 'anniversary'];
const ADVENTURE_KEYWORDS = ['adventure', 'hiking', 'trek', 'outdoor', 'extreme'];
const LUXURY_KEYWORDS = ['luxury', 'premium', '5-star', 'five star', 'upscale'];
const BACKPACKER_KEYWORDS = ['backpack', 'budget', 'hostel', ' shoestring'];

/**
 * Normalizes a string for keyword matching.
 * @param {unknown} value
 * @returns {string}
 */
const normalize = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

/**
 * Checks if any keyword appears in the combined context string.
 * @param {string} context
 * @param {string[]} keywords
 * @returns {boolean}
 */
const contextIncludes = (context, keywords) =>
  keywords.some((keyword) => context.includes(keyword));

/**
 * Derives personalization flags from user input for bonus prompt sections.
 * @param {import('../services/aiService.types.js').TravelPlanRequest} input
 * @returns {Record<string, boolean>}
 */
export const derivePersonalizationFlags = (input) => {
  const budget = Number(input.budget) || 0;
  const travelersText = normalize(input.travelers);
  const styleText = normalize(input.travelStyle);
  const interestsText = normalize(
    Array.isArray(input.interests) ? input.interests.join(' ') : input.interests
  );
  const combined = `${travelersText} ${styleText} ${interestsText}`;

  return {
    isLowBudget: budget > 0 && budget <= LOW_BUDGET_THRESHOLD,
    isFamily: contextIncludes(combined, FAMILY_TRAVELER_KEYWORDS),
    isSolo: contextIncludes(combined, SOLO_TRAVELER_KEYWORDS),
    isHoneymoon: contextIncludes(combined, HONEYMOON_KEYWORDS),
    isAdventure: contextIncludes(combined, ADVENTURE_KEYWORDS),
    isLuxury: contextIncludes(combined, LUXURY_KEYWORDS),
    isBackpacker: contextIncludes(combined, BACKPACKER_KEYWORDS) || (budget > 0 && budget <= LOW_BUDGET_THRESHOLD),
  };
};

/**
 * Builds bonus personalization instructions based on trip context.
 * @param {import('../services/aiService.types.js').TravelPlanRequest} input
 * @returns {string}
 */
const buildPersonalizationDirectives = (input) => {
  const flags = derivePersonalizationFlags(input);
  const directives = [];

  if (flags.isLowBudget || flags.isBackpacker) {
    directives.push(
      '- Prioritize free and low-cost attractions, public transport, street food, and budget accommodations.',
      '- Highlight free walking tours, parks, markets, and museums with free admission days where applicable.'
    );
  }

  if (flags.isFamily) {
    directives.push(
      '- Recommend kid-friendly attractions, playgrounds, interactive museums, and family-suitable restaurants.',
      '- Include rest breaks, shorter transit segments, and stroller/wheelchair accessibility notes where relevant.',
      '- Avoid late-night or adult-only venues.'
    );
  }

  if (flags.isSolo) {
    directives.push(
      '- Include solo-traveler safety advice: safe neighborhoods, trusted transport options, and social/hostel alternatives.',
      '- Recommend well-lit, populated areas for evening activities.'
    );
  }

  if (flags.isHoneymoon) {
    directives.push(
      '- Recommend romantic viewpoints, sunset spots, fine dining, couples spa experiences, and scenic walks.',
      '- Balance relaxation with a few memorable special-occasion experiences.'
    );
  }

  if (flags.isAdventure) {
    directives.push(
      '- Include adventure activities: hiking, water sports, guided treks, or local adrenaline experiences suited to the destination.',
      '- Note fitness levels, gear requirements, and seasonal availability.'
    );
  }

  if (flags.isLuxury) {
    directives.push(
      '- Recommend premium hotels, Michelin or highly rated restaurants, private transfers, and exclusive experiences.',
      '- Allocate budget toward comfort, concierge services, and skip-the-line access where realistic.'
    );
  }

  if (directives.length === 0) {
    directives.push('- Tailor recommendations to the stated travel style and interests.');
  }

  return directives.join('\n');
};

/**
 * Formats interests for the prompt regardless of array or string input.
 * @param {string | string[]} interests
 * @returns {string}
 */
const formatInterests = (interests) => {
  if (Array.isArray(interests)) {
    return interests.filter(Boolean).join(', ') || 'General sightseeing';
  }
  return typeof interests === 'string' && interests.trim() ? interests.trim() : 'General sightseeing';
};

/**
 * Builds the system prompt that defines model persona and global constraints.
 * @returns {string}
 */
export const buildSystemPrompt = () => `
You are an expert international travel consultant with 20 years of experience planning trips across all continents.

Your role is to produce a complete, realistic, and personalized travel plan in a SINGLE response.

CRITICAL RULES — FOLLOW EXACTLY:
1. Return ONLY valid JSON. No Markdown. No code fences. No explanations before or after the JSON.
2. Do NOT hallucinate. If you are uncertain about specific facts (exact prices, phone numbers, opening hours, addresses, or current events), use the phrase "Information may vary." instead of inventing details.
3. Design itineraries that optimize travel time: group nearby attractions, avoid backtracking, use realistic transit durations, and never create impossible schedules.
4. Consider weather, seasonal crowds, public transport availability, budget constraints, travel pace, and traveler composition.
5. For emergency contacts and hotlines, provide widely known general formats or categories when exact numbers are uncertain, and always include a disclaimer that the traveler must verify locally.
6. Every day in dailyPlan MUST include morning, afternoon, and evening blocks. Each block MUST include: activities, location, estimatedDuration, estimatedCost, transportation, foodRecommendation, and travelTips.
7. Populate ALL top-level keys: tripSummary, dailyPlan, budgetAllocation, packingList, transportation, foods, safetyTips, localEtiquette, bestTimeToVisit, emergencyInfo, travelChecklist.
8. The number of entries in dailyPlan MUST equal the requested trip duration in days.
9. tripSummary.dailyTravelSummary MUST contain one entry per day.
10. Use practical, actionable language. Think like a professional travel planner, not a generic chatbot.

OUTPUT JSON STRUCTURE (follow this shape precisely):
${JSON.stringify(TRAVEL_PLAN_JSON_SCHEMA, null, 2)}
`.trim();

/**
 * Builds the user prompt from trip request parameters.
 * @param {import('../services/aiService.types.js').TravelPlanRequest} input
 * @returns {string}
 */
export const buildUserPrompt = (input) => {
  const interests = formatInterests(input.interests);
  const duration = Number(input.duration);

  return `
Create a complete ${duration}-day travel plan with the following parameters:

- Destination: ${input.destination}
- Starting location: ${input.startingLocation || 'Not specified — assume international arrival at the main gateway city/airport'}
- Duration: ${duration} day(s)
- Budget: ${input.budget != null ? `${input.budget} (total trip budget — allocate realistically across all categories)` : 'Not specified — provide a reasonable mid-range estimate and note "Information may vary."'}
- Travelers: ${input.travelers}
- Travel style: ${input.travelStyle || 'Balanced'}
- Season / travel period: ${input.season || 'Not specified — infer from destination and note assumptions'}
- Interests: ${interests}

ITINERARY REQUIREMENTS:
- Group geographically close attractions on the same day.
- Assign realistic time windows (morning 8:00–12:00, afternoon 12:00–17:00, evening 17:00–22:00) without over-packing.
- Include estimated cost and transportation mode for each time block.
- Include a food recommendation for each time block (local must-try where possible).
- Include 1–3 practical travelTips per time block.
- Provide a dailyTravelSummary for each day inside dailyPlan AND in tripSummary.dailyTravelSummary.

PERSONALIZATION DIRECTIVES:
${buildPersonalizationDirectives(input)}

ADDITIONAL SECTIONS:
- budgetAllocation: realistic breakdown aligned with the stated budget; include moneySavingTips.
- packingList: categorized checklist suited to destination, season, and activities.
- transportation: airport transfers, inter-city, and local transit options.
- foods: must-try local dishes with where to try them.
- safetyTips: destination-relevant safety guidance.
- localEtiquette: cultural norms and respectful behavior.
- bestTimeToVisit: ideal months/seasons with crowd and weather notes.
- emergencyInfo: general emergency guidance with verification disclaimer.
- travelChecklist: pre-trip tasks (documents, bookings, apps, insurance).

Remember: output ONLY the JSON object. No other text.
`.trim();
};

/**
 * Builds the full prompt payload for the AI provider.
 * @param {import('../services/aiService.types.js').TravelPlanRequest} input
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export const buildTravelPlanPrompts = (input) => ({
  systemPrompt: buildSystemPrompt(),
  userPrompt: buildUserPrompt(input),
});

export default buildTravelPlanPrompts;
