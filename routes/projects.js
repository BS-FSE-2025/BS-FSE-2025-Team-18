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
    const email = req.user.email;
    const projects = await Project.find({ email: email })
      .populate('products.productId', '_id name image pricePerMeter');

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
          itemId: new mongoose.Types.ObjectId(), // מזהה ייחודי חדש לכל פריט
          productId,
          quantity,
          name: product.name,
          image: product.image,
          price: product.pricePerMeter,
      };

      const project = await Project.findOneAndUpdate(
          { _id: req.params.projectId, email: email },
          { $push: { products: productDetails } },
          { new: true }
      );

      if (!project) {
          return res.status(404).json({ message: "Project not found or not authorized." });
      }

      res.json(project);
  } catch (error) {
      console.error("Error adding product to project:", error);
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
// Remove a product from a project
const ObjectId = mongoose.Types.ObjectId;

router.put('/:projectId/removeProduct', verifyToken, async (req, res) => {
  const { itemId } = req.body; // מזהה ייחודי למחיקת פריט
  const email = req.user.email;

  try {
      const project = await Project.findOneAndUpdate(
          { _id: req.params.projectId, email: email },
          { $pull: { products: { itemId: new mongoose.Types.ObjectId(itemId) } } }, // מחיקת פריט ספציפי לפי itemId
          { new: true }
      );

      if (!project) {
          return res.status(404).json({ message: "Project not found or not authorized." });
      }

      res.json({ message: "Product removed successfully", project });
  } catch (error) {
      console.error("Error removing product:", error);
      res.status(500).json({ error: error.message });
  }
});

const GalleryProject = require('../models/GalleryProject');

// Share a project to the gallery
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      if (project.sharedToGallery) {
          return res.status(400).json({ message: "Project is already shared to the gallery." });
      }

      const image = project.products.length > 0 ? project.products[0].image : 'default-image-path';


      const galleryProject = new GalleryProject({
          name: project.name,
          description: project.description,
          image: image,
          products: project.products.map(product => ({
              productId: product.productId,
              name: product.name,
              price: product.price,
              quantity: product.quantity,
              category: product.category || 'Uncategorized',
              image: product.image,
          })),
      });

      await galleryProject.save();
      project.sharedToGallery = true;
      await project.save();

      res.status(201).json({ message: "Project shared to gallery successfully!" });
  } catch (error) {
      console.error("Error sharing project to gallery:", error);
      res.status(500).json({ message: "Failed to share project to gallery", error: error.message });
  }
});



// Generate PDF for a project
// Get details of a single project
router.get('/:id', verifyToken, async (req, res) => {
  try {
      const project = await Project.findById(req.params.id).populate('products.productId', '_id name image pricePerMeter');
      if (!project) {
          return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json(project);
  } catch (error) {
      console.error("Error fetching project:", error.message);
      res.status(500).json({ message: "Failed to fetch project details", error: error.message });
  }
});







module.exports = router;