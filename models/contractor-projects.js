const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },  // Store the contractor's email to associate the project with them
  status: { type: String, default: 'Pending' },
  sharedToGallery: { type: Boolean, default: false },
  image: { type: String }, // נתיב התמונה


  products: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // מזהה ייחודי לכל פריט
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },
      name: { type: String, required: true }, // שם המוצר
      image: { type: String, required: true }, // תמונת המוצר
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // שדה חדש למחיר ליחידה
      status: { type: String, default: "To Do" }, // ברירת מחדל
      totalTime: { type: Number, required: true, default: 1 },
    },
  ],
  
}, { timestamps: true });

module.exports = mongoose.model('contractor-projects', projectSchema);
