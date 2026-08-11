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

// Static paths before /:id
router.post("/generate", aiRateLimiter, generateTrip);
router.post("/pdf", generateTripPdfController);
router.post("/generate-pdf", generateTripPdfController);
router.post("/save", createTripController);
router.post("/", createTripController);
router.get("/history", getTripHistoryController);
router.delete("/delete/:id", deleteTripController);

router.get("/:id", getTripByIdController);
router.put("/:id", updateTripController);
router.delete("/:id", deleteTripController);

module.exports = router;
