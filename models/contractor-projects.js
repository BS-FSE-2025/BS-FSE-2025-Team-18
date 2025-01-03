const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },  // Store the contractor's email to associate the project with them
  status: { type: String, default: 'Pending' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },
      name: { type: String, required: true }, // שם המוצר
      image: { type: String, required: true }, // תמונת המוצר
      quantity: { type: Number, required: true },
    },
  ],
  
}, { timestamps: true });

module.exports = mongoose.model('contractor-projects', projectSchema);
