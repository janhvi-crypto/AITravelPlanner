const express = require("express");
const { listReviews, createReview } = require("../controllers/reviewsController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listReviews);
router.post("/", requireAuth, createReview);

module.exports = router;
