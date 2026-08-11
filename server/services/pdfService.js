const PDFDocument = require("pdfkit");

function createTripPDF(tripPlan, res) {
    const doc = new PDFDocument({
        margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${tripPlan.destination}-travel-plan.pdf"`
    );

    doc.pipe(res);

    // Title
    doc
        .fontSize(24)
        .text("AI Travel Planner", { align: "center" });

    doc.moveDown();

    doc
        .fontSize(18)
        .text(`${tripPlan.destination} Travel Plan`, {
            align: "center"
        });

    doc.moveDown();

    // Basic information
    doc.fontSize(12);
    doc.text(`Duration: ${tripPlan.days} days`);
    doc.text(`Total Budget: ₹${tripPlan.budget}`);
    doc.text(`Estimated Daily Cost: ₹${tripPlan.dailyCostEstimate}`);
    doc.text(`Best Time to Visit: ${tripPlan.bestTimeToVisit}`);

    doc.moveDown();

    // Safety
    doc.fontSize(16).text("Safety Tips");
    doc.moveDown(0.5);

    tripPlan.safetyTips.forEach((tip) => {
        doc.fontSize(11).text(`• ${tip}`);
    });

    doc.moveDown();

    // Cultural etiquette
    doc.fontSize(16).text("Cultural Etiquette");
    doc.moveDown(0.5);

    tripPlan.culturalEtiquette.forEach((item) => {
        doc.fontSize(11).text(`• ${item}`);
    });

    doc.moveDown();

    // Places
    doc.fontSize(16).text("Places to Visit");
    doc.moveDown(0.5);

    tripPlan.placesToVisit.forEach((place) => {
        doc.fontSize(13).text(place.name);
        doc.fontSize(11).text(place.description);
        doc.text(`Estimated time: ${place.estimatedTime}`);
        doc.moveDown(0.5);
    });

    doc.addPage();

    // Itinerary
    doc.fontSize(18).text("Day-by-Day Itinerary");
    doc.moveDown();

    tripPlan.itinerary.forEach((day) => {
        doc.fontSize(16).text(`Day ${day.day}: ${day.title}`);
        doc.moveDown(0.5);

        day.activities.forEach((activity) => {
            doc.fontSize(12).text(
                `${activity.time} - ${activity.activity}`
            );

            doc.fontSize(10).text(activity.description);
            doc.text(`Estimated Cost: ₹${activity.estimatedCost}`);

            doc.moveDown(0.5);
        });

        doc.moveDown();
    });

    // Food
    doc.addPage();

    doc.fontSize(18).text("Must-Try Food");
    doc.moveDown();

    tripPlan.mustTryFood.forEach((food) => {
        doc.fontSize(13).text(food.name);
        doc.fontSize(11).text(food.description);
        doc.moveDown(0.5);
    });

    // Packing list
    doc.moveDown();
    doc.fontSize(18).text("Packing List");
    doc.moveDown(0.5);

    tripPlan.packingList.forEach((item) => {
        doc.fontSize(11).text(`☐ ${item}`);
    });

    // Travel checklist
    doc.moveDown();
    doc.fontSize(18).text("Travel Checklist");
    doc.moveDown(0.5);

    tripPlan.travelChecklist.forEach((item) => {
        doc.fontSize(11).text(`☐ ${item}`);
    });

    // Budget
    doc.addPage();

    doc.fontSize(18).text("Budget Allocation");
    doc.moveDown();

    const budget = tripPlan.budgetAllocation;

    doc.fontSize(12).text(`Accommodation: ₹${budget.accommodation}`);
    doc.text(`Food: ₹${budget.food}`);
    doc.text(`Transportation: ₹${budget.transportation}`);
    doc.text(`Activities: ₹${budget.activities}`);
    doc.text(`Miscellaneous: ₹${budget.miscellaneous}`);

    // Transportation
    doc.moveDown();
    doc.fontSize(18).text("Transportation Plan");
    doc.moveDown();

    tripPlan.transportationPlan.forEach((transport) => {
        doc.fontSize(13).text(transport.type);
        doc.fontSize(11).text(transport.description);
        doc.text(`Estimated Cost: ₹${transport.estimatedCost}`);
        doc.moveDown(0.5);
    });

    doc.end();
}

module.exports = {
    createTripPDF
};