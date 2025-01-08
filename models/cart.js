const mongoose = require('mongoose');

// תת-סכמה לפריט בעגלה
const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true }, // מזהה מוצר
    quantity: { type: Number, required: true }, // כמות
    price: { type: Number, required: true }, // מחיר יחידה
    totalPrice: { type: Number, required: true }, // מחיר כולל
    status: { type: String, default: "Pending" }, // סטטוס פריט

});

// סכמת עגלה
const cartSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // וודא שהוא ייחודי
    items: [cartItemSchema], // פריטים בעגלה
}, { timestamps: true }); // יוסיף שדות זמן אוטומטיים (createdAt, updatedAt)

module.exports = mongoose.model('Cart', cartSchema);
