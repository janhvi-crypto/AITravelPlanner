const express = require("express");
const router = express.Router();

const {
    createTripController,
    getTripHistoryController,
    getTripByIdController,
    updateTripController,
    deleteTripController,
    generateTrip
} = require("../controllers/tripController");

router.post("/", createTripController);

router.get("/history", getTripHistoryController);

router.get("/:id", getTripByIdController);

router.put("/:id", updateTripController);

router.delete("/:id", deleteTripController);

router.post("/generate", generateTrip);

module.exports = router;