function formatTripResponse(rawResponse, inputParams = {}) {
    try {
        let parsedResponse;
        if (typeof rawResponse === "string") {
            // Remove markdown code fences if Gemini adds them
            const cleanedResponse = rawResponse
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();
            parsedResponse = JSON.parse(cleanedResponse);
        } else if (typeof rawResponse === "object" && rawResponse !== null) {
            parsedResponse = rawResponse;
        } else {
            throw new Error("Invalid raw response format");
        }

        const overviewObj = parsedResponse.overview || {};
        const prefsObj = parsedResponse.prefs || inputParams;

        let dest = parsedResponse.destination || prefsObj.destination || overviewObj["Destination"] || overviewObj.destination || "Destination";
        
        let daysCount = Number(parsedResponse.days || prefsObj.days || 0);
        if (!daysCount && overviewObj["Duration"]) {
            daysCount = parseInt(overviewObj["Duration"]) || 1;
        }
        if (!daysCount) daysCount = 1;

        let budgetTotal = Number(parsedResponse.budget || prefsObj.budget || 0);
        if (!budgetTotal && overviewObj["Budget"]) {
            budgetTotal = parseInt(String(overviewObj["Budget"]).replace(/[^0-9]/g, "")) || 0;
        }

        // Normalize Places
        const rawPlaces = parsedResponse.places || parsedResponse.placesToVisit || [];
        const places = rawPlaces.map((p) => typeof p === "string" ? { name: p, category: "Attraction", note: "", estimatedTime: "1-2 hours" } : {
            name: p.name || "Local Spot",
            category: p.category || "Attraction",
            note: p.note || p.description || "",
            description: p.description || p.note || "",
            estimatedTime: p.estimatedTime || "1-2 hours",
        });

        // Normalize Must Try Food
        const rawFood = parsedResponse.must_try_food || parsedResponse.mustTryFood || [];
        const mustTryFood = rawFood.map((f) => typeof f === "string" ? { name: f, description: "Local delicacy", where: "Local eateries", cost: 200 } : {
            name: f.name || "Local Speciality",
            description: f.description || f.where || "Must try local dish",
            where: f.where || f.description || "Local markets",
            cost: Number(f.cost || 200),
        });

        // Normalize Transport
        const rawTransport = parsedResponse.transport_plan || parsedResponse.transportationPlan || [];
        const transportPlan = rawTransport.map((t) => typeof t === "string" ? { route: t, mode: "Local Transport", cost: 300, duration: "30 mins", type: "Local Transport", description: t, estimatedCost: 300 } : {
            route: t.route || t.type || "City Travel",
            mode: t.mode || t.type || "Cab / Metro",
            cost: Number(t.cost || t.estimatedCost || 300),
            duration: t.duration || "30 mins",
            type: t.type || t.mode || "Cab / Metro",
            description: t.description || t.route || "Local transit",
            estimatedCost: Number(t.estimatedCost || t.cost || 300),
        });

        // Normalize Lists
        const packingList = (parsedResponse.packing_list || parsedResponse.packingList || ["ID & Documents", "Comfortable clothes", "Mobile Charger", "Personal Medication"]).map(String);
        const travelChecklist = (parsedResponse.travel_checklist || parsedResponse.travelChecklist || ["Confirm bookings", "Check weather forecast", "Pack essentials"]).map(String);
        const safetyTips = (parsedResponse.safety_tips || parsedResponse.safetyTips || ["Keep emergency contacts handy", "Stay in well-lit public areas"]).map(String);
        const culturalEtiquette = (parsedResponse.cultural_etiquette || parsedResponse.culturalEtiquette || ["Dress appropriately at sacred sites", "Respect local customs"]).map(String);

        // Normalize Budget Breakdown
        const rawBudget = parsedResponse.budget_breakdown || parsedResponse.budgetAllocation || {};
        const budgetBreakdown = {
            "Accommodation": Number(rawBudget.Accommodation || rawBudget.accommodation || Math.round(budgetTotal * 0.4)),
            "Food": Number(rawBudget.Food || rawBudget.food || Math.round(budgetTotal * 0.25)),
            "Transportation": Number(rawBudget.Transportation || rawBudget.transportation || Math.round(budgetTotal * 0.15)),
            "Activities": Number(rawBudget.Activities || rawBudget.activities || Math.round(budgetTotal * 0.15)),
            "Miscellaneous": Number(rawBudget.Miscellaneous || rawBudget.miscellaneous || Math.round(budgetTotal * 0.05)),
        };

        const budgetAllocation = {
            accommodation: budgetBreakdown["Accommodation"],
            food: budgetBreakdown["Food"],
            transportation: budgetBreakdown["Transportation"],
            activities: budgetBreakdown["Activities"],
            miscellaneous: budgetBreakdown["Miscellaneous"],
        };

        // Normalize Daily Costs
        const dailyAvg = Math.round(budgetTotal / (daysCount || 1));
        const rawDailyCosts = parsedResponse.daily_costs || [];
        const dailyCosts = Array.isArray(rawDailyCosts) && rawDailyCosts.length > 0
            ? rawDailyCosts.map((d, idx) => ({ day: d.day || idx + 1, total: Number(d.total || dailyAvg) }))
            : Array.from({ length: daysCount }, (_, i) => ({ day: i + 1, total: dailyAvg }));

        // Normalize Itinerary
        const rawItinerary = Array.isArray(parsedResponse.itinerary) ? parsedResponse.itinerary : [];
        const itinerary = rawItinerary.map((d, i) => {
            const dayNum = d.day || i + 1;
            const title = d.title || `Day ${dayNum} Exploration`;
            const weather = d.weather || "Pleasant, sunny";
            const rawActs = d.blocks || d.activities || [];
            
            const blocks = rawActs.map((act) => ({
                time: act.time || "Morning",
                activity: act.activity || "Explore city center",
                detail: act.detail || act.description || "",
                cost: Number(act.cost || act.estimatedCost || 0),
            }));

            const activities = rawActs.map((act) => ({
                time: act.time || "Morning",
                activity: act.activity || "Explore city center",
                description: act.description || act.detail || "",
                estimatedCost: Number(act.estimatedCost || act.cost || 0),
            }));

            return {
                day: dayNum,
                title,
                weather,
                blocks,
                activities,
            };
        });

        // Overview
        const overview = parsedResponse.overview || {
            "Destination": dest,
            "Duration": `${daysCount} Days`,
            "Budget": `₹${budgetTotal.toLocaleString("en-IN")}`,
            "Pacing": "Balanced",
            "Experience": `Explore the best of ${dest} within ₹${budgetTotal.toLocaleString("en-IN")}`,
        };

        return {
            destination: dest,
            days: daysCount,
            budget: budgetTotal,
            dailyCostEstimate: parsedResponse.dailyCostEstimate || dailyAvg,
            bestTimeToVisit: parsedResponse.bestTimeToVisit || "October to March",
            overview,
            places,
            placesToVisit: places,
            must_try_food: mustTryFood,
            mustTryFood: mustTryFood,
            transport_plan: transportPlan,
            transportationPlan: transportPlan,
            packing_list: packingList,
            packingList: packingList,
            travel_checklist: travelChecklist,
            travelChecklist: travelChecklist,
            safety_tips: safetyTips,
            safetyTips: safetyTips,
            cultural_etiquette: culturalEtiquette,
            culturalEtiquette: culturalEtiquette,
            budget_breakdown: budgetBreakdown,
            budgetAllocation: budgetAllocation,
            daily_costs: dailyCosts,
            itinerary,
        };

    } catch (error) {
        console.error("Response formatting error:", error);
        console.error("Raw Gemini response:", rawResponse);
        throw new Error("Gemini returned an invalid response structure");
    }
}

module.exports = {
    formatTripResponse
};