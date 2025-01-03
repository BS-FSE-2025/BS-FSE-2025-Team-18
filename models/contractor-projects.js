const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },  // Store the contractor's email to associate the project with them
  status: { type: String, default: 'Pending' },
  products: [  // Array to store catalog items added to the project
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },  // Reference to the CatalogItem model
      quantity: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('contractor-projects', projectSchema);
