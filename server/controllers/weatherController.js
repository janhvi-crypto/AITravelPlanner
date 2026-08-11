const { getWeather } = require("../services/weatherService");

async function getWeatherData(req, res) {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required."
            });
        }

        const weather = await getWeather(city);

        return res.status(200).json({
            success: true,
            data: weather
        });

    } catch (error) {
        console.error("Weather controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch weather data."
        });
    }
}

module.exports = {
    getWeatherData
};