const express = require('express');
const multer = require('multer');
const path = require('path');
const GalleryProject = require('../models/GalleryProject');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Add a new gallery project
router.post('/', upload.single('image'), async (req, res) => {
    const { name, description, products } = req.body;
    const image = req.file ? req.file.path : '';

    try {
        const newProject = new GalleryProject({
            name,
            description,
            image,
            products: JSON.parse(products),
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error adding gallery project:', error);
        res.status(500).json({ message: 'Failed to add project to gallery' });
    }
});



router.get("/", async (req, res) => {
    try {
        const projects = await GalleryProject.find();
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching gallery projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

router.get('/:id', async (req, res) => {
    try {
      const project = await GalleryProject.findById(req.params.id).populate('products.productId');
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project details', error });
    }
  });

router.delete('/:id', async (req, res) => {
    try {
        const project = await GalleryProject.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Failed to delete project" });
    }
});

module.exports = router;





