const express = require('express');
const Project = require('../models/contractor-projects');  // Project Model
const CatalogItem = require('../models/CatalogItem');  // Catalog Item Model
const { verifyToken } = require('./authMiddleware'); // Middleware for JWT token validation
const router = express.Router();
const mongoose = require('mongoose');


// Create a new project
router.post("/", verifyToken, async (req, res) => {
  const { name, description } = req.body;
  const email = req.user.email;  // Ensure the email is extracted from the JWT token

  if (!name || !description) {
    return res.status(400).json({ message: "Project name and description are required" });
  }

  try {
    const newProject = new Project({
      name,
      description,
      email,  // Associate the project with the contractor's email
    });

    await newProject.save();  // Save the new project
    res.status(201).json(newProject);  // Return the created project
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Failed to add project" });
  }
});

// Get all projects for the authenticated contractor (user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const email = req.user.email; // האימייל של המשתמש המחובר
    const projects = await Project.find({ email: email })
      .populate('products.productId', 'name image'); // אוכלוס שם ותמונה של המוצר

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message });
  }
});


// Add a product to a project (from the catalog)
router.put('/:projectId/addProductToProject', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const email = req.user.email;

  try {
    const product = await CatalogItem.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in catalog" });
    }

    const productDetails = {
      productId,
      quantity,
      name: product.name,
      image: product.image,
    };

    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, email: email },
      { $push: { products: productDetails } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    res.json(project);
  } catch (error) {
    console.error("Error adding product to project:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:projectId/removeProduct', verifyToken, async (req, res) => {
  const { productId } = req.body; // קבלת productId מהבקשה
  const email = req.user.email; // אימייל מהטוקן

  // בדיקה אם המזהה תקין
  if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format." });
  }

  try {
      const project = await Project.findOneAndUpdate(
          { _id: req.params.projectId, email: email }, // ודא שהפרויקט שייך למשתמש
          { $pull: { products: { productId: mongoose.Types.ObjectId(productId) } } }, // מחיקת המוצר
          { new: true }
      );

      if (!project) {
          return res.status(404).json({ message: 'Project not found or unauthorized' });
      }

      res.json({ message: 'Product removed successfully', project }); // תגובה עם המידע המעודכן
  } catch (error) {
      console.error("Error removing product from project:", error);
      res.status(500).json({ error: error.message });
  }
});


// Update a project
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;  // Get email from the authenticated user (JWT token)
    
    // Ensure the project belongs to the authenticated user by matching the email
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, email: email },  // Ensure the project is owned by the authenticated user
      req.body,
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you are not authorized to update this project' });
    }

    res.json(project);  // Return the updated project
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(400).json({ error: error.message });  // Bad request error
  }
});

// Delete a project
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;  // Get email from the authenticated user (JWT token)
    
    // Ensure the project belongs to the authenticated user by matching the email
    const project = await Project.findOneAndDelete({ _id: req.params.id, email: email });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you are not authorized to delete this project' });
    }

    res.json({ message: 'Project deleted successfully' });  // Return success message
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: error.message });  // Internal server error
  }
});

module.exports = router;