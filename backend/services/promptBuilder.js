function buildTripPrompt(prefs = {}) {
  const {
    destination,
    budget,
    days,
    people = 1,
    transport = "Public / local",
    food_preference = "Local cuisine",
    travel_style = "Balanced",
    interests = [],
    safety_preference = "Standard",
    pet_friendly = false,
    festival_music = "",
  } = prefs;

  const interestList = Array.isArray(interests)
    ? interests.join(", ")
    : String(interests || "general sightseeing");

  return `
You are an expert AI travel planner for trips in India and nearby destinations.

Create a detailed, realistic, practical and budget-conscious travel plan.

TRIP DETAILS:
- Destination: ${destination}
- Total Budget: ₹${budget}
- Number of Days: ${days}
- Travellers: ${people}
- Preferred transport: ${transport}
- Food preference: ${food_preference}
- Travel style: ${travel_style}
- Interests: ${interestList || "general sightseeing"}
- Safety preference: ${safety_preference}
- Pet friendly needed: ${pet_friendly ? "Yes" : "No"}
- Festival / music preference: ${festival_music || "None"}

IMPORTANT:
- Stay within the total budget of ₹${budget}.
- Create exactly ${days} days in the itinerary.
- Respect food preference (${food_preference}) and travel style (${travel_style}).
- Prefer ${transport} where practical.
- Account for ${people} traveller(s) in cost estimates.
- Be practical — do not overcrowd days; include travel time between spots.
- Use Indian Rupees (₹) for all estimated costs (estimates only, not live prices).
- Do not invent live availability, opening hours, or exact current prices.
- Include authentic local food that fits the food preference.
- Include destination-specific safety tips and cultural etiquette.
${pet_friendly ? "- Include pet-friendly stays/activities where possible." : ""}
${festival_music ? `- Weave in festival/music interest: ${festival_music}.` : ""}

RETURN FORMAT:
Return ONLY valid JSON. No markdown. No code fences. No comments. No trailing commas.

Use exactly this structure (snake_case keys):

{
  "destination": "${destination}",
  "days": ${days},
  "budget": ${budget},
  "overview": {
    "Destination": "${destination}",
    "Duration": "${days} Days",
    "Budget": "₹${budget}",
    "Pacing": "${travel_style}",
    "Experience": "short one-line summary"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "",
      "weather": "",
      "blocks": [
        { "time": "Morning", "activity": "", "detail": "", "cost": 0 }
      ]
    }
  ],
  "places": [
    { "name": "", "category": "", "note": "" }
  ],
  "packing_list": [""],
  "travel_checklist": [""],
  "budget_breakdown": {
    "Accommodation": 0,
    "Food": 0,
    "Transportation": 0,
    "Activities": 0,
    "Miscellaneous": 0
  },
  "transport_plan": [
    { "route": "", "mode": "", "cost": 0, "duration": "" }
  ],
  "must_try_food": [
    { "name": "", "where": "", "cost": 0 }
  ],
  "safety_tips": [""],
  "cultural_etiquette": [""],
  "daily_costs": [
    { "day": 1, "total": 0 }
  ]
}

CONTENT REQUIREMENTS:
1. Exactly ${days} itinerary day objects, numbered 1..${days}.
2. Each day: morning / afternoon / evening blocks where appropriate.
3. budget_breakdown values must sum to roughly ≤ ₹${budget}.
4. daily_costs length must equal ${days}.
5. Keep geography practical for ${destination}.
6. Costs are estimates only.

The final response MUST be valid JSON matching the structure above.
`;
}

module.exports = { buildTripPrompt };
