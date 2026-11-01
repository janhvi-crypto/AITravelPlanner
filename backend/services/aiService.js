const { GoogleGenAI } = require("@google/genai");

function isMissingOrPlaceholderKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return true;
  // Placeholders only — real Google AI Studio keys may start with AIza... OR AQ.
  const lower = key.toLowerCase();
  return (
    lower.includes("your-gemini") ||
    lower.includes("your-api-key") ||
    lower === "your-gemini-api-key" ||
    lower.startsWith("changeme")
  );
}

async function generateTripPlan(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (isMissingOrPlaceholderKey(apiKey)) {
    console.warn("[aiService] GEMINI_API_KEY missing or still a placeholder. Skipping Gemini call.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  // Prefer GEMINI_MODEL from .env. New AI Studio keys often cannot call older
  // 2.x models; gemini-3.1-flash-lite is a reliable default for itinerary JSON.
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    });

    return response.text;
  } catch (error) {
    console.error("[aiService] Gemini API Error:", error.message || error);
    throw error;
  }
}

module.exports = { generateTripPlan, isMissingOrPlaceholderKey };
