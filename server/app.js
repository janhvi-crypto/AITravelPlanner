const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const tripRoutes = require("./routes/tripRoutes");

app.get("/", (req, res) => {
    res.send("AI Travel Planner Backend is Running 🚀");
});

app.use("/trip", tripRoutes);

const { testDatabaseConnection } = require("./services/tripService");

app.get("/test-db", async (req, res) => {
    try {
        const data = await testDatabaseConnection();

        res.json({
            success: true,
            message: "Database connected successfully",
            data
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});