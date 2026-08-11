const express = require("express");
const { listPlaces, getPlaceBySlug, getRecommendedPlaces } = require("../controllers/placesController");

const router = express.Router();

router.get("/", listPlaces);
router.get("/recommended", getRecommendedPlaces);
router.get("/:slug", getPlaceBySlug);

module.exports = router;
