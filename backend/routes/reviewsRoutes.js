const express = require("express");
const { listReviews, createReview } = require("../controllers/reviewsController");

const router = express.Router();

router.get("/", listReviews);
router.post("/", createReview);

module.exports = router;
