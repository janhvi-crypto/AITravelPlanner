const axios = require("axios");

async function getWeather(city) {
    if (!process.env.OPENWEATHER_API_KEY) {
        return {
            city: city.charAt(0).toUpperCase() + city.slice(1),
            temperature: 26,
            feelsLike: 27,
            humidity: 55,
            weather: "Sunny",
            description: "Clear sky and pleasant conditions",
            windSpeed: 4.2
        };
    }

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
            weather: data.weather[0]?.main || "Clear",
            description: data.weather[0]?.description || "Clear sky",
            windSpeed: data.wind.speed
        };

    } catch (error) {
        console.error(
            "Weather API Error:",
            error.response?.data || error.message
        );

        return {
            city: city.charAt(0).toUpperCase() + city.slice(1),
            temperature: 25,
            feelsLike: 25,
            humidity: 60,
            weather: "Pleasant",
            description: "Pleasant weather for sightseeing",
            windSpeed: 3.5
        };
    }
}

module.exports = {
    getWeather
};