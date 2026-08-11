const { getWeather } = require("../services/weatherService");

async function getWeatherData(req, res) {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    const weather = await getWeather(city);

    // Frontend Weather shape + nested legacy data
    return res.status(200).json({
      success: true,
      city: weather.city,
      temp: weather.temperature,
      condition: weather.description || weather.weather,
      humidity: weather.humidity,
      rain_chance: 0,
      advice: `Feels like ${weather.feelsLike}°C · ${weather.description}`,
      suitable: true,
      data: weather,
    });
  } catch (error) {
    console.error("Weather controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather data.",
    });
  }
}

module.exports = { getWeatherData };
