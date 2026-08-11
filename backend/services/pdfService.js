const PDFDocument = require("pdfkit");

function createTripPDF(tripPlan, res) {
    const doc = new PDFDocument({
        margin: 50
    });

    const dest = tripPlan.destination || "Travel";
    const days = tripPlan.days || 1;
    const budget = tripPlan.budget || 0;
    const dailyCostEstimate = tripPlan.dailyCostEstimate || Math.round(budget / days);
    const bestTimeToVisit = tripPlan.bestTimeToVisit || "October to March";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(dest)}-travel-plan.pdf"`
    );

    doc.pipe(res);

    // Title
    doc
        .fontSize(24)
        .text("AI Travel Planner", { align: "center" });

    doc.moveDown();

    doc
        .fontSize(18)
        .text(`${dest} Travel Plan`, {
            align: "center"
        });

    doc.moveDown();

    // Basic information
    doc.fontSize(12);
    doc.text(`Duration: ${days} days`);
    doc.text(`Total Budget: ₹${budget}`);
    doc.text(`Estimated Daily Cost: ₹${dailyCostEstimate}`);
    doc.text(`Best Time to Visit: ${bestTimeToVisit}`);

    doc.moveDown();

    // Safety
    const safetyTips = tripPlan.safetyTips || tripPlan.safety_tips || [];
    if (safetyTips.length > 0) {
        doc.fontSize(16).text("Safety Tips");
        doc.moveDown(0.5);
        safetyTips.forEach((tip) => {
            doc.fontSize(11).text(`• ${tip}`);
        });
        doc.moveDown();
    }

    // Cultural etiquette
    const culturalEtiquette = tripPlan.culturalEtiquette || tripPlan.cultural_etiquette || [];
    if (culturalEtiquette.length > 0) {
        doc.fontSize(16).text("Cultural Etiquette");
        doc.moveDown(0.5);
        culturalEtiquette.forEach((item) => {
            doc.fontSize(11).text(`• ${item}`);
        });
        doc.moveDown();
    }

    // Places
    const placesToVisit = tripPlan.placesToVisit || tripPlan.places || [];
    if (placesToVisit.length > 0) {
        doc.fontSize(16).text("Places to Visit");
        doc.moveDown(0.5);
        placesToVisit.forEach((place) => {
            doc.fontSize(13).text(place.name || "Attraction");
            doc.fontSize(11).text(place.description || place.note || "");
            if (place.estimatedTime) doc.text(`Estimated time: ${place.estimatedTime}`);
            doc.moveDown(0.5);
        });
    }

    // Itinerary
    const itinerary = tripPlan.itinerary || [];
    if (itinerary.length > 0) {
        doc.addPage();
        doc.fontSize(18).text("Day-by-Day Itinerary");
        doc.moveDown();

        itinerary.forEach((day) => {
            doc.fontSize(16).text(`Day ${day.day}: ${day.title || ""}`);
            doc.moveDown(0.5);

            const activities = day.activities || day.blocks || [];
            activities.forEach((activity) => {
                doc.fontSize(12).text(
                    `${activity.time || "Time"} - ${activity.activity || "Activity"}`
                );

                const desc = activity.description || activity.detail || "";
                if (desc) doc.fontSize(10).text(desc);
                const cost = activity.estimatedCost ?? activity.cost;
                if (cost != null) doc.text(`Estimated Cost: ₹${cost}`);

                doc.moveDown(0.5);
            });

            doc.moveDown();
        });
    }

    // Food
    const mustTryFood = tripPlan.mustTryFood || tripPlan.must_try_food || [];
    if (mustTryFood.length > 0) {
        doc.addPage();
        doc.fontSize(18).text("Must-Try Food");
        doc.moveDown();

        mustTryFood.forEach((food) => {
            doc.fontSize(13).text(food.name || "Local Dish");
            doc.fontSize(11).text(food.description || food.where || "");
            doc.moveDown(0.5);
        });
    }

    // Packing list
    const packingList = tripPlan.packingList || tripPlan.packing_list || [];
    if (packingList.length > 0) {
        doc.moveDown();
        doc.fontSize(18).text("Packing List");
        doc.moveDown(0.5);

        packingList.forEach((item) => {
            doc.fontSize(11).text(`☐ ${item}`);
        });
    }

    // Travel checklist
    const travelChecklist = tripPlan.travelChecklist || tripPlan.travel_checklist || [];
    if (travelChecklist.length > 0) {
        doc.moveDown();
        doc.fontSize(18).text("Travel Checklist");
        doc.moveDown(0.5);

        travelChecklist.forEach((item) => {
            doc.fontSize(11).text(`☐ ${item}`);
        });
    }

    // Budget
    const bAlloc = tripPlan.budgetAllocation || {};
    const bBreak = tripPlan.budget_breakdown || {};
    doc.addPage();
    doc.fontSize(18).text("Budget Allocation");
    doc.moveDown();

    const accommodationCost = bAlloc.accommodation ?? bBreak.Accommodation ?? bBreak.accommodation ?? 0;
    const foodCost = bAlloc.food ?? bBreak.Food ?? bBreak.food ?? 0;
    const transportCost = bAlloc.transportation ?? bBreak.Transportation ?? bBreak.transportation ?? 0;
    const activitiesCost = bAlloc.activities ?? bBreak.Activities ?? bBreak.activities ?? 0;
    const miscCost = bAlloc.miscellaneous ?? bBreak.Miscellaneous ?? bBreak.miscellaneous ?? 0;

    doc.fontSize(12).text(`Accommodation: ₹${accommodationCost}`);
    doc.text(`Food: ₹${foodCost}`);
    doc.text(`Transportation: ₹${transportCost}`);
    doc.text(`Activities: ₹${activitiesCost}`);
    doc.text(`Miscellaneous: ₹${miscCost}`);

    // Transportation
    const transportationPlan = tripPlan.transportationPlan || tripPlan.transport_plan || [];
    if (transportationPlan.length > 0) {
        doc.moveDown();
        doc.fontSize(18).text("Transportation Plan");
        doc.moveDown();

        transportationPlan.forEach((transport) => {
            doc.fontSize(13).text(transport.type || transport.mode || transport.route || "Transport");
            doc.fontSize(11).text(transport.description || transport.duration || "");
            const tCost = transport.estimatedCost ?? transport.cost;
            if (tCost != null) doc.text(`Estimated Cost: ₹${tCost}`);
            doc.moveDown(0.5);
        });
    }

    doc.end();
}

module.exports = {
    createTripPDF
};