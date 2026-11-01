const express = require("express");
const router = express.Router();

const {
  createTripController,
  getTripHistoryController,
  getTripByIdController,
  updateTripController,
  deleteTripController,
  generateTrip,
  generateTripPdfController,
} = require("../controllers/tripController");

const { aiRateLimiter } = require("../middleware/rateLimiter");
const { requireAuth } = require("../middleware/authMiddleware");

// Public / soft-auth: AI generate + PDF (no DB write)
router.post("/generate", aiRateLimiter, generateTrip);
router.post("/pdf", generateTripPdfController);
router.post("/generate-pdf", generateTripPdfController);

// Protected: must be logged in with a real Supabase token
router.post("/save", requireAuth, createTripController);
router.post("/", requireAuth, createTripController);
router.get("/history", requireAuth, getTripHistoryController);
router.delete("/delete/:id", requireAuth, deleteTripController);

router.get("/:id", requireAuth, getTripByIdController);
router.put("/:id", requireAuth, updateTripController);
router.delete("/:id", requireAuth, deleteTripController);

module.exports = router;
