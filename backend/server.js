require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const aiRoutes = require("./routes/aiRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const placesRoutes = require("./routes/placesRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { testDatabaseConnection } = require("./services/tripService");

const app = express();

const origins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .flatMap((v) => String(v).split(",").map((s) => s.trim()));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(null, true); // allow during student demos; tighten CLIENT_URL in prod
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    message: "AI Travel Planner Backend is running!",
    modules: ["auth", "trip CRUD", "places", "reviews", "AI/weather"],
  });
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/config/maps", (_req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || "" });
});

app.get("/test-db", async (_req, res) => {
  try {
    const data = await testDatabaseConnection();
    res.json({ success: true, message: "Database connected successfully", data });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Frontend contract (frontend/src/services/api.ts)
app.use("/auth", authRoutes);
app.use("/trip", tripRoutes);
app.use("/weather", weatherRoutes);
app.use("/places", placesRoutes);
app.use("/reviews", reviewsRoutes);

// Branch/legacy paths
app.use("/api/auth", authRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/trips", aiRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI Travel Planner API running on http://localhost:${PORT}`);
});
