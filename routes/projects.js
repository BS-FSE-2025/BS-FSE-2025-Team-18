const express = require('express');
const Project = require('../models/contractor-projects');  // Project Model
const CatalogItem = require('../models/CatalogItem');  // Catalog Item Model
const { verifyToken } = require('./authMiddleware'); // Middleware for JWT token validation
const router = express.Router();

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
    const email = req.user.email;  // Get the email from the authenticated user (JWT token)
    
    // Find all projects for this contractor (by their email)
    const projects = await Project.find({ email: email });
    
    
    res.json(projects);  // Return the list of projects
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message });  // Internal server error
  }
});

// Add a product to a project (from the catalog)
router.put('/:projectId/addProductToProject', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;  // Get productId and quantity from the request
  const email = req.user.email;  // Extract email from the JWT token

  // Check if the product exists in the catalog
  const product = await CatalogItem.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found in catalog" });
  }

  try {
    // Find the project by ID and update it by adding the selected product
    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, email: email }, // Ensure the project belongs to the authenticated user
      { $push: { products: { productId, quantity } } }, // Add the product to the project's products array
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you are not authorized to add products to this project' });
    }

    res.json(project);  // Return the updated project
  } catch (error) {
    console.error("Error adding product to project:", error);
    res.status(500).json({ error: error.message });  // Internal server error
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