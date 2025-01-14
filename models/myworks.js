const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
});

const myWorkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  products: [productSchema],
  email: { type: String, required: true }, // כתובת דוא"ל לשיוך פרויקט למשתמש
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MyWorks', myWorkSchema);