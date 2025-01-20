// const mongoose = require("mongoose");

// const catalogItemSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     pricePerMeter: { type: Number, required: true },
//     category: { type: String, required: true },
//     image: { type: String, required: true }, // Path or URL for the image
// });

// module.exports = mongoose.model("CatalogItem", catalogItemSchema);

const mongoose = require("mongoose");

const catalogItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerMeter: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Path or URL for the image
    totalTime: { type: Number, required: true},
});

module.exports = mongoose.model("CatalogItem", catalogItemSchema);
