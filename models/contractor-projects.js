const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    products: [
        {
            name: String,
            quantity: Number,
            price: Number,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('contractor-projects', projectSchema);
