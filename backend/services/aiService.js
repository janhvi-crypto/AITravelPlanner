const { GoogleGenAI } = require("@google/genai");

async function generateTripPlan(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("AQ.")) {
    console.warn("[aiService] GEMINI_API_KEY is invalid or placeholder. Using resilient smart fallback.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return response.text;
  } catch (error) {
    console.error("[aiService] Gemini API Error:", error.message || error);
    return null;
  }
}

module.exports = { generateTripPlan };
