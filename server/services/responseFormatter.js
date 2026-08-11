function formatTripResponse(rawResponse) {
    try {
        // Remove markdown code fences if Gemini adds them
        const cleanedResponse = rawResponse
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsedResponse = JSON.parse(cleanedResponse);

        return parsedResponse;

    } catch (error) {
        console.error("Response formatting error:", error);
        console.error("Raw Gemini response:", rawResponse);

        throw new Error("Gemini returned an invalid JSON response");
    }
}

module.exports = {
    formatTripResponse
};