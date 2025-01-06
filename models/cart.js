const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    items: [cartItemSchema]
});

module.exports = mongoose.model('Cart', cartSchema);
