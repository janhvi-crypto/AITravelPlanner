const { listReviews, createReview } = require("../services/reviewsService");

const listReviewsController = async (req, res) => {
  try {
    const reviews = await listReviews({ place: req.query.place });
    res.json(reviews);
  } catch (error) {
    console.error("List reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

const createReviewController = async (req, res) => {
  try {
    // Support JSON body, or FormData fields already parsed into req.body
    const body = req.body || {};
    const review = await createReview(body, req.user);
    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    const status = /login required/i.test(error.message) ? 401 : 400;
    res.status(status).json({
      success: false,
      message: error.message || error.details || "Failed to create review",
    });
  }
};

module.exports = {
  listReviews: listReviewsController,
  createReview: createReviewController,
};
