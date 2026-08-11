const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateTripPlan(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate travel plan using Gemini");
    }
}

module.exports = {
    generateTripPlan
};