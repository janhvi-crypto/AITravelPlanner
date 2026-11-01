const {
  createTrip,
  getTripHistory,
  getTripById,
  updateTrip,
  deleteTrip,
  mapTripPayload,
} = require("../services/tripService");

const { buildTripPrompt } = require("../services/promptBuilder");
const { generateTripPlan, isMissingOrPlaceholderKey } = require("../services/aiService");
const { formatTripResponse } = require("../services/responseFormatter");
const { createTripPDF } = require("../services/pdfService");

function collectPrefs(body = {}) {
  return {
    destination: body.destination,
    budget: body.budget,
    days: body.days,
    people: body.people,
    transport: body.transport,
    food_preference: body.food_preference,
    travel_style: body.travel_style,
    interests: body.interests,
    safety_preference: body.safety_preference,
    pet_friendly: body.pet_friendly,
    festival_music: body.festival_music,
  };
}

function stubPlan(prefs) {
  const { destination, budget, days, transport, food_preference, travel_style } = prefs;
  return {
    overview: {
      Destination: String(destination),
      Duration: `${days} Days`,
      Budget: `₹${Number(budget).toLocaleString("en-IN")}`,
      Experience: "Stub itinerary — add GEMINI_API_KEY for real AI",
    },
    itinerary: Array.from({ length: Number(days) }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} — Exploring ${destination}`,
      weather: "Pleasant",
      blocks: [
        {
          time: "Morning",
          activity: `Top sights in ${destination}`,
          detail: "Sightseeing",
          cost: Math.round(Number(budget) * 0.05),
        },
        {
          time: "Afternoon",
          activity: "Local lunch & walk",
          detail: `Try ${food_preference || "local"} food`,
          cost: Math.round(Number(budget) * 0.05),
        },
        {
          time: "Evening",
          activity: "Sunset & free time",
          detail: "Relax and photograph",
          cost: Math.round(Number(budget) * 0.03),
        },
      ],
    })),
    places: [
      { name: `${destination} City Center`, category: "Attraction", note: "Main hub" },
      { name: `${destination} Old Town`, category: "Heritage", note: "Local markets" },
    ],
    packing_list: ["Government ID", "Charger", "Comfortable shoes", "Sunscreen"],
    travel_checklist: ["Confirm stay", "Check weather", "Save emergency contacts"],
    budget_breakdown: {
      Accommodation: Math.round(Number(budget) * 0.4),
      Food: Math.round(Number(budget) * 0.25),
      Transportation: Math.round(Number(budget) * 0.15),
      Activities: Math.round(Number(budget) * 0.15),
      Miscellaneous: Math.round(Number(budget) * 0.05),
    },
    transport_plan: [
      {
        route: `${destination} local transit`,
        mode: transport || "Cab / Metro",
        cost: Math.round(Number(budget) * 0.1),
        duration: "30 mins",
      },
    ],
    must_try_food: [{ name: `Local speciality`, where: "Popular eatery", cost: 300 }],
    safety_tips: ["Keep valuables secure", "Use registered transport"],
    cultural_etiquette: ["Dress respectfully at sacred sites"],
    daily_costs: Array.from({ length: Number(days) }, (_, i) => ({
      day: i + 1,
      total: Math.round(Number(budget) / Number(days)),
    })),
  };
}

const createTripController = async (req, res) => {
  try {
    const row = mapTripPayload(req.body || {}, req.user.id);
    const trip = await createTrip(row);
    res.status(201).json({ success: true, message: "Trip created successfully", trip });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({
      success: false,
      message: error.message || error.details || "Failed to create trip",
    });
  }
};

const getTripHistoryController = async (req, res) => {
  try {
    const trips = await getTripHistory(req.user.id);
    res.status(200).json({ success: true, trips });
  } catch (error) {
    console.error("Get trip history error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trip history" });
  }
};

const getTripByIdController = async (req, res) => {
  try {
    const trip = await getTripById(req.params.id, req.user.id);
    res.status(200).json({ success: true, trip });
  } catch (error) {
    console.error("Get trip by ID error:", error);
    res.status(404).json({ success: false, message: "Trip not found" });
  }
};

const updateTripController = async (req, res) => {
  try {
    const patch = mapTripPayload({ ...req.body, plan: req.body.plan || req.body }, req.user.id);
    // Don't overwrite user_id on update
    delete patch.user_id;
    const trip = await updateTrip(req.params.id, patch, req.user.id);
    res.status(200).json({ success: true, message: "Trip updated successfully", trip });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ success: false, message: "Failed to update trip" });
  }
};

const deleteTripController = async (req, res) => {
  try {
    const trip = await deleteTrip(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Trip deleted successfully", trip });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ success: false, message: "Failed to delete trip" });
  }
};

/** POST /trip/generate — Gemini itinerary */
const generateTrip = async (req, res) => {
  try {
    const prefs = collectPrefs(req.body);

    if (!prefs.destination || !prefs.days || !prefs.budget) {
      return res.status(400).json({
        success: false,
        message: "Destination, days and budget are required",
      });
    }

    if (isMissingOrPlaceholderKey(process.env.GEMINI_API_KEY)) {
      const normalizedStub = formatTripResponse(stubPlan(prefs), prefs);
      return res.status(200).json({
        success: true,
        message:
          "GEMINI_API_KEY not set — returning stub. Add a real key from https://aistudio.google.com/apikey (AIza… or AQ.… both work).",
        data: normalizedStub,
        ...normalizedStub,
      });
    }

    const prompt = buildTripPrompt(prefs);
    const rawResponse = await generateTripPlan(prompt);

    if (!rawResponse) {
      const normalizedStub = formatTripResponse(stubPlan(prefs), prefs);
      return res.status(200).json({
        success: true,
        message: "Gemini returned an empty response — showing stub itinerary.",
        data: normalizedStub,
        ...normalizedStub,
      });
    }

    const tripPlan = formatTripResponse(rawResponse, prefs);

    return res.status(200).json({
      success: true,
      message: "Itinerary generated with Gemini",
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
    const destination =
      body.destination || (body.overview && body.overview["Destination"]) || "Destination";
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
