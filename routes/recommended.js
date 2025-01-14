const express = require('express');
const router = express.Router();
const CatalogItem = require('../models/CatalogItem');

// מסלול לקבלת מוצרים מומלצים
router.get('/', async (req, res) => {
  try {
    // שולף מוצרים רנדומליים מתוך המוצרים הקיימים (מוגבל ל-5 למשל)
    const recommendedProducts = await CatalogItem.aggregate([
      { $sample: { size: 5 } } // בוחר 5 מוצרים באופן רנדומלי
    ]);
    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ message: 'Failed to fetch recommended products' });
  }
});

module.exports = router;
