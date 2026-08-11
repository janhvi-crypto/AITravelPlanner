const { buildTripPrompt } = require("../services/promptBuilder");
const { generateTripPlan } = require("../services/aiService");
const { formatTripResponse } = require("../services/responseFormatter");
const { createTripPDF } = require("../services/pdfService");

async function generateTrip(req, res) {
    try {
        const { destination, budget, days } = req.body;

        // Validate input
        if (!destination || !budget || !days) {
            return res.status(400).json({
                success: false,
                message: "Destination, budget and days are required."
            });
        }

        if (Number(budget) <= 0 || Number(days) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Budget and days must be greater than zero."
            });
        }

        // Build AI prompt
        const prompt = buildTripPrompt({
            destination,
            budget,
            days
        });

        // Send prompt to Gemini
        const rawResponse = await generateTripPlan(prompt);

        // Convert Gemini response into JSON
        const tripPlan = formatTripResponse(rawResponse);

        // Send response to frontend
        return res.status(200).json({
            success: true,
            data: tripPlan
        });

    } catch (error) {
        console.error("Trip generation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate travel plan."
        });
    }
}


async function generateTripPDF(req, res) {
    try {
        const { destination, budget, days } = req.body;

        // Validate input
        if (!destination || !budget || !days) {
            return res.status(400).json({
                success: false,
                message: "Destination, budget and days are required."
            });
        }

        if (Number(budget) <= 0 || Number(days) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Budget and days must be greater than zero."
            });
        }

        // Build AI prompt
        const prompt = buildTripPrompt({
            destination,
            budget,
            days
        });

        // Generate trip using Gemini
        const rawResponse = await generateTripPlan(prompt);

        // Convert Gemini response into JSON
        const tripPlan = formatTripResponse(rawResponse);

        // Create and send PDF
        createTripPDF(tripPlan, res);

    } catch (error) {
        console.error("PDF generation error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate travel plan PDF."
            });
        }
    }
}


module.exports = {
    generateTrip,
    generateTripPDF
};