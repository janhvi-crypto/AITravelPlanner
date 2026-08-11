const {
    createTrip,
    getTripHistory,
    getTripById,
    updateTrip,
    deleteTrip
} = require("../services/tripService");

const createTripController = async (req, res) => {
    try {
        const trip = await createTrip(req.body);

        res.status(201).json({
            success: true,
            message: "Trip created successfully",
            trip
        });
    } catch (error) {
        console.error("Create trip error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create trip"
        });
    }
};

const getTripHistoryController = async (req, res) => {
    try {
        const trips = await getTripHistory();

        res.status(200).json({
            success: true,
            trips
        });
    } catch (error) {
        console.error("Get trip history error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch trip history"
        });
    }
};

const getTripByIdController = async (req, res) => {
    try {
        const trip = await getTripById(req.params.id);

        res.status(200).json({
            success: true,
            trip
        });
    } catch (error) {
        console.error("Get trip by ID error:", error);

        res.status(404).json({
            success: false,
            message: "Trip not found"
        });
    }
};

const updateTripController = async (req, res) => {
    try {
        const trip = await updateTrip(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: "Trip updated successfully",
            trip
        });
    } catch (error) {
        console.error("Update trip error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update trip"
        });
    }
};

const deleteTripController = async (req, res) => {
    try {
        const trip = await deleteTrip(req.params.id);

        res.status(200).json({
            success: true,
            message: "Trip deleted successfully",
            trip
        });
    } catch (error) {
        console.error("Delete trip error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete trip"
        });
    }
};

const generateTrip = async (req, res) => {
    try {
        const {
            destination,
            budget,
            days,
            people,
            transport,
            food_preference,
            travel_style,
            interests
        } = req.body;

        if (!destination || !days || !budget) {
            return res.status(400).json({
                success: false,
                message: "Destination, days and budget are required"
            });
        }

        res.status(200).json({
            success: true,
            message: "Trip details received successfully",
            input: {
                destination,
                budget,
                days,
                people,
                transport,
                food_preference,
                travel_style,
                interests
            }
        });

    } catch (error) {
        console.error("Generate trip error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate trip"
        });
    }
};

module.exports = {
    createTripController,
    getTripHistoryController,
    getTripByIdController,
    updateTripController,
    deleteTripController,
    generateTrip
};
