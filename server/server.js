require("dotenv").config();

const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/aiRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// AI Trip Routes
app.use("/api/trips", aiRoutes);
app.use("/api/weather", weatherRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "AI Travel Planner Backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});