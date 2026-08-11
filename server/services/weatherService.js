const axios = require("axios");

async function getWeather(city) {
    try {
        const response = await axios.get(
            "https://api.openweathermap.org/data/2.5/weather",
            {
                params: {
                    q: city,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: "metric"
                }
            }
        );

        const data = response.data;

        return {
            city: data.name,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            weather: data.weather[0].main,
            description: data.weather[0].description,
            windSpeed: data.wind.speed
        };

    } catch (error) {
        console.error(
            "Weather API Error:",
            error.response?.data || error.message
        );

        throw new Error("Failed to fetch weather data");
    }
}

module.exports = {
    getWeather
};