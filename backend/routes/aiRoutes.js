const express = require("express");

const {
    generateTrip,
    generateTripPDF
} = require("../controllers/aiController");

const router = express.Router();

// Generate AI travel plan
router.post("/generate", generateTrip);

// Generate downloadable PDF
router.post("/generate-pdf", generateTripPDF);

module.exports = router;