// const mongoose = require("mongoose");

// const catalogItemSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     pricePerMeter: { type: Number, required: true },
//     category: { type: String, required: true },
//     image: { type: String, required: true }, // Path or URL for the image
// });

// module.exports = mongoose.model("CatalogItem", catalogItemSchema);


const mongoose = require('mongoose');

const catalogItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },  // URL or path to the image of the product
}, { timestamps: true });

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
