/**
 * Shared JSDoc type definitions for the AI travel planning module.
 */

/**
 * @typedef {Object} TravelPlanRequest
 * @property {string} destination - Primary destination city/country/region
 * @property {number} duration - Trip length in days
 * @property {number} [budget] - Total trip budget (currency assumed local or USD unless specified elsewhere)
 * @property {string | string[]} interests - Travel interests (e.g. history, food, nature)
 * @property {string | number} travelers - Traveler description or count (e.g. "2 adults, 1 child")
 * @property {string} [travelStyle] - e.g. luxury, backpacker, adventure, honeymoon
 * @property {string} [season] - Intended travel season or month range
 * @property {string} [startingLocation] - Origin city/country before arrival
 */

/**
 * @typedef {Object} TimeBlock
 * @property {string[]} activities
 * @property {string} location
 * @property {string} estimatedDuration
 * @property {string} estimatedCost
 * @property {string} transportation
 * @property {string} foodRecommendation
 * @property {string[]} travelTips
 */

/**
 * @typedef {Object} DailyPlanEntry
 * @property {number} day
 * @property {string} date
 * @property {string} theme
 * @property {TimeBlock} morning
 * @property {TimeBlock} afternoon
 * @property {TimeBlock} evening
 * @property {string} dailyEstimatedCost
 * @property {string} dailyTransportationSummary
 * @property {string} dailyTravelSummary
 */

/**
 * @typedef {Object} TravelPlanResponse
 * @property {Record<string, unknown>} tripSummary
 * @property {DailyPlanEntry[]} dailyPlan
 * @property {Record<string, unknown>} budgetAllocation
 * @property {Array<Record<string, unknown>>} packingList
 * @property {Array<Record<string, unknown>>} transportation
 * @property {Array<Record<string, unknown>>} foods
 * @property {string[]} safetyTips
 * @property {string[]} localEtiquette
 * @property {string} bestTimeToVisit
 * @property {Record<string, string>} emergencyInfo
 * @property {Array<Record<string, unknown>>} travelChecklist
 */

export {};
