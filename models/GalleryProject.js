const mongoose = require('mongoose');

const galleryProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // נתיב התמונה
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true }, // מחיר המוצר
            quantity: { type: Number, required: true }, // כמות
            category: { type: String, required: true }, // קטגוריה
            image: { type: String, required: true }, // תמונת המוצר
        },
    ],
});

module.exports = mongoose.model('GalleryProject', galleryProjectSchema);