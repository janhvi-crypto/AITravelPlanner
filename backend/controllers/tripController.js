const {
  createTrip,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../services/tripService");

const { buildTripPrompt } = require("../services/promptBuilder");
const { generateTripPlan } = require("../services/aiService");
const { formatTripResponse } = require("../services/responseFormatter");
const { createTripPDF } = require("../services/pdfService");

const createTripController = async (req, res) => {
  try {
    const trip = await createTrip(req.body);
    res.status(201).json({ success: true, message: "Trip created successfully", trip });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create trip" });
  }
};

const getTripHistoryController = async (req, res) => {
  try {
    const trips = await getTripHistory();
    res.status(200).json({ success: true, trips });
  } catch (error) {
    console.error("Get trip history error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trip history" });
  }
};

const getTripByIdController = async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);
    res.status(200).json({ success: true, trip });
  } catch (error) {
    console.error("Get trip by ID error:", error);
    res.status(404).json({ success: false, message: "Trip not found" });
  }
};

const updateTripController = async (req, res) => {
  try {
    const trip = await updateTrip(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Trip updated successfully", trip });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ success: false, message: "Failed to update trip" });
  }
};

const deleteTripController = async (req, res) => {
  try {
    const trip = await deleteTrip(req.params.id);
    res.status(200).json({ success: true, message: "Trip deleted successfully", trip });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ success: false, message: "Failed to delete trip" });
  }
};

/** Member-3 AI generation wired to frontend POST /trip/generate */
const generateTrip = async (req, res) => {
  try {
    const {
      destination,
      budget,
      days,
      people,
      transport,
      food_preference,
      travel_style,
      interests,
    } = req.body;

    if (!destination || !days || !budget) {
      return res.status(400).json({
        success: false,
        message: "Destination, days and budget are required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Soft response so frontend can still develop without Gemini
      const stubRaw = {
        overview: {
          "Destination": String(destination),
          "Duration": `${days} Days`,
          "Budget": `₹${Number(budget).toLocaleString("en-IN")}`,
          "Experience": "Stub itinerary for offline testing",
        },
        itinerary: [
          {
            day: 1,
            title: `Arrive in ${destination}`,
            weather: "Pleasant",
            blocks: [
              { time: "Morning", activity: "Check-in & local walk", detail: "Hotel check-in", cost: 0 },
              { time: "Evening", activity: "Try local food", detail: "Explore local market", cost: 300 },
            ],
          },
        ],
        places: [{ name: String(destination), category: "City", note: "Main hub", estimatedTime: "Full day" }],
        packing_list: ["ID & Documents", "Charger", "Comfortable shoes"],
        travel_checklist: ["Book stay", "Check weather"],
        budget_breakdown: {
          Accommodation: Math.round(Number(budget) * 0.4),
          Food: Math.round(Number(budget) * 0.3),
          Transportation: Math.round(Number(budget) * 0.2),
          Activities: Math.round(Number(budget) * 0.1),
        },
        transport_plan: [{ route: "City Center", mode: "Cab", cost: 300, duration: "20 mins" }],
        must_try_food: [{ name: "Local Thali", where: "City Center", cost: 250 }],
        safety_tips: ["Keep valuables secure", "Stay aware of surroundings"],
        cultural_etiquette: ["Dress respectfully at heritage sites"],
        daily_costs: [{ day: 1, total: Math.round(Number(budget) / Number(days)) }],
      };

      const normalizedStub = formatTripResponse(stubRaw, { destination, budget, days });

      return res.status(200).json({
        success: true,
        message: "GEMINI_API_KEY not set — returning structured stub. Add key for real AI.",
        data: normalizedStub,
        ...normalizedStub,
      });
    }

    const prompt = buildTripPrompt({
      destination,
      budget,
      days,
      people,
      transport,
      food_preference,
      travel_style,
      interests,
    });

    const rawResponse = await generateTripPlan(prompt);
    let tripPlan;
    if (rawResponse) {
      tripPlan = formatTripResponse(rawResponse, { destination, budget, days });
    } else {
      const fallbackRaw = {
        overview: {
          "Destination": String(destination),
          "Duration": `${days} Days`,
          "Budget": `₹${Number(budget).toLocaleString("en-IN")}`,
          "Experience": `Custom ${travel_style || "travel"} itinerary for ${destination}`,
        },
        itinerary: Array.from({ length: Number(days) }, (_, i) => ({
          day: i + 1,
          title: `Day ${i + 1} - Exploring ${destination}`,
          weather: "Pleasant & sunny",
          blocks: [
            { time: "Morning", activity: `Visit top attractions in ${destination}`, detail: "Sightseeing & heritage monuments", cost: Math.round(Number(budget) * 0.05) },
            { time: "Afternoon", activity: `Local lunch & market stroll`, detail: `Sample ${food_preference || "local"} cuisine`, cost: Math.round(Number(budget) * 0.05) },
            { time: "Evening", activity: `Sunset viewpoint & relaxation`, detail: "Picturesque views and photography", cost: Math.round(Number(budget) * 0.03) },
          ],
        })),
        places: [
          { name: `${destination} City Center`, category: "Attraction", note: "Cultural hub", estimatedTime: "2-3 hours" },
          { name: `${destination} Old Town`, category: "Heritage", note: "Historic market", estimatedTime: "2 hours" },
        ],
        packing_list: ["Government ID", "Mobile Charger", "Comfortable walking shoes", "Sunscreen & Sunglasses"],
        travel_checklist: ["Confirm hotel reservations", "Check weather updates", "Keep local emergency contacts"],
        budget_breakdown: {
          Accommodation: Math.round(Number(budget) * 0.4),
          Food: Math.round(Number(budget) * 0.25),
          Transportation: Math.round(Number(budget) * 0.15),
          Activities: Math.round(Number(budget) * 0.15),
          Miscellaneous: Math.round(Number(budget) * 0.05),
        },
        transport_plan: [{ route: `${destination} City Transit`, mode: transport || "Cab / Metro", cost: Math.round(Number(budget) * 0.1), duration: "30 mins" }],
        must_try_food: [{ name: `Special ${destination} Thali`, where: "Popular local eatery", cost: 300 }],
        safety_tips: ["Keep emergency contacts saved", "Use registered transport services"],
        cultural_etiquette: ["Dress modestly at religious monuments", "Ask before photographing locals"],
        daily_costs: Array.from({ length: Number(days) }, (_, i) => ({ day: i + 1, total: Math.round(Number(budget) / Number(days)) })),
      };
      tripPlan = formatTripResponse(fallbackRaw, { destination, budget, days });
    }

    return res.status(200).json({
      success: true,
      data: tripPlan,
      ...tripPlan,
    });
  } catch (error) {
    console.error("Generate trip error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate trip",
    });
  }
};

const generateTripPdfController = async (req, res) => {
  try {
    const body = req.body || {};
    const destination = body.destination || (body.overview && body.overview["Destination"]) || "Destination";
    const budget = body.budget || (body.overview && body.overview["Budget"]) || 0;
    const days = body.days || (body.overview && body.overview["Duration"]) || 1;

    const normalizedPlan = formatTripResponse(body, { destination, budget, days });
    createTripPDF(normalizedPlan, res);
  } catch (error) {
    console.error("PDF generation controller error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF document" });
    }
  }
};

module.exports = {
  createTripController,
  getTripHistoryController,
  getTripByIdController,
  updateTripController,
  deleteTripController,
  generateTrip,
  generateTripPdfController,
};
