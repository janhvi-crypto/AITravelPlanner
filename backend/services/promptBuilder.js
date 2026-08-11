function buildTripPrompt({ destination, budget, days }) {
    return `
You are an expert AI travel planner.

Create a detailed, realistic, practical and budget-conscious travel plan.

TRIP DETAILS:
Destination: ${destination}
Total Budget: ₹${budget}
Number of Days: ${days}

IMPORTANT:
- The entire trip must stay within the total budget of ₹${budget}.
- Create exactly ${days} days in the itinerary.
- The itinerary should be practical and not overcrowded.
- Consider realistic travel time between places.
- Use Indian Rupees (₹) for all estimated costs.
- Costs are estimates only, not live prices.
- Do not invent live availability, current ratings, opening hours or exact current prices.
- Do not claim that a place or restaurant is currently open unless verified by an external API.
- Recommend a mixture of popular attractions and local/less-crowded places when appropriate.
- Include authentic local food.
- Consider the destination's culture, weather and safety.
- Avoid recommending activities that are unrealistic for the number of days.
- Make sure the budget allocation approximately adds up to the total budget.

RETURN FORMAT:

Return ONLY valid JSON.

DO NOT:
- Use markdown.
- Use code blocks.
- Add explanations before or after the JSON.
- Add comments inside the JSON.
- Add trailing commas.
- Return invalid JSON.

Use exactly this structure:

{
    "destination": "${destination}",
    "days": ${days},
    "budget": ${budget},

    "dailyCostEstimate": 0,

    "bestTimeToVisit": "",

    "safetyTips": [
        ""
    ],

    "culturalEtiquette": [
        ""
    ],

    "placesToVisit": [
        {
            "name": "",
            "description": "",
            "estimatedTime": ""
        }
    ],

    "itinerary": [
        {
            "day": 1,
            "title": "",
            "activities": [
                {
                    "time": "",
                    "activity": "",
                    "description": "",
                    "estimatedCost": 0
                }
            ]
        }
    ],

    "mustTryFood": [
        {
            "name": "",
            "description": ""
        }
    ],

    "packingList": [
        ""
    ],

    "travelChecklist": [
        ""
    ],

    "budgetAllocation": {
        "accommodation": 0,
        "food": 0,
        "transportation": 0,
        "activities": 0,
        "miscellaneous": 0
    },

    "transportationPlan": [
        {
            "type": "",
            "description": "",
            "estimatedCost": 0
        }
    ]
}

CONTENT REQUIREMENTS:

1. Generate exactly ${days} itinerary objects.
2. Each itinerary object must have the correct day number from 1 to ${days}.
3. Each day should contain a reasonable number of activities.
4. Include morning, afternoon and evening activities where appropriate.
5. Include estimated costs for activities.
6. The total estimated cost of accommodation, food, transportation, activities and miscellaneous expenses should not exceed ₹${budget}.
7. The following must be approximately true:

   accommodation + food + transportation + activities + miscellaneous <= ${budget}

8. dailyCostEstimate should represent a reasonable average daily spending amount based on the total budget.
9. Include important attractions suitable for ${destination}.
10. Include some local or less-crowded experiences when appropriate.
11. Include destination-specific safety tips.
12. Include destination-specific cultural etiquette.
13. Include practical transportation options.
14. Include useful packing items based on the destination and expected activities.
15. Include a practical travel checklist.
16. Include authentic local food recommendations.
17. Avoid recommending food that conflicts with the destination's cuisine unless appropriate.
18. Keep the itinerary geographically practical. Avoid unnecessarily travelling back and forth across the destination.
19. Do not create impossible schedules.
20. If the destination is expensive, prioritize activities and accommodation options that can realistically fit the given budget.
21. If the budget is very low, clearly prioritize low-cost or free attractions and activities.
22. All costs should be reasonable estimates and should not be presented as live prices.

The final response MUST be valid JSON matching the exact structure above.
`;
}

module.exports = { buildTripPrompt };