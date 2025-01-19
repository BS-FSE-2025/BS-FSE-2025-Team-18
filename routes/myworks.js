const express = require('express');
const multer = require('multer');
const path = require('path');
const MyWork = require('../models/myworks');
const GalleryProject = require('../models/GalleryProject');
const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Create a new work
router.post('/', upload.single('image'), async (req, res) => {
    const { name, description, products, email } = req.body;
    const image = req.file ? req.file.path : '';
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      const parsedProducts = JSON.parse(products);
  
      const newWork = new MyWork({
        name,
        description,
        image,
        products: parsedProducts,
        email,
      });
  
      await newWork.save();
      res.status(201).json(newWork);
    } catch (error) {
      console.error('Error saving work:', error);
      res.status(500).json({ message: 'Failed to save work', error });
    }
  });
  
// Get all works for a specific user by email
router.get('/:email', async (req, res) => {
    const email = req.params.email;
  
    try {
      const works = await MyWork.find({ email });
      res.status(200).json(works);
    } catch (error) {
      console.error('Error fetching works:', error);
      res.status(500).json({ message: 'Failed to fetch works', error });
    }
  });
  
  
// Get all works
router.get('/', async (req, res) => {
    try {
      const works = await MyWork.find().populate('products.productId'); // שים לב לפקודת `populate` אם יש קשר למודל אחר
      res.status(200).json(works);
    } catch (error) {
      console.error('Error fetching works:', error);
      res.status(500).json({ message: 'Failed to fetch works' });
    }
  });
  

// Delete a work
// Delete a work by ID
router.delete('/:id', async (req, res) => {
    try {
      const work = await MyWork.findByIdAndDelete(req.params.id);
      if (!work) {
        return res.status(404).json({ message: 'Work not found' });
      }
      res.status(200).json({ message: 'Work deleted successfully' });
    } catch (error) {
      console.error('Error deleting work:', error);
      res.status(500).json({ message: 'Failed to delete work', error });
    }
  });
  

// Share a work to gallery
router.post('/:id/share', async (req, res) => {
    try {
      const work = await MyWork.findById(req.params.id);
      if (!work) {
        return res.status(404).json({ message: 'Work not found' });
      }
  
      // יצירת פרויקט חדש בגלריה עם המידע מהפרויקט
      const newGalleryProject = new GalleryProject({
        name: work.name,
        description: work.description,
        image: work.image,
        products: work.products, // העברת המוצרים מהפרויקט
      });
  
      await newGalleryProject.save();
      res.status(201).json({ message: 'Work shared to gallery successfully' });
    } catch (error) {
      console.error('Error sharing work to gallery:', error);
      res.status(500).json({ message: 'Failed to share work to gallery', error });
    }
  });
  
  
module.exports = router;