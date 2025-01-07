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


router.put('/updateProductStatus', verifyToken, async (req, res) => {
  const { itemId, status } = req.body;

  // בדיקה אם itemId ו-status קיימים
  if (!itemId || !status) {
      return res.status(400).json({ message: "ItemId ו-Status הם שדות חובה" });
  }

  // בדיקה אם הסטטוס חוקי
  const allowedStatuses = ["To Do", "In Progress", "Done"];
  if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "סטטוס לא חוקי" });
  }

  // בדיקה אם ה-itemId הוא ObjectId חוקי
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "פורמט itemId לא חוקי" });
  }

  try {
      const project = await Project.findOneAndUpdate(
          { "products.itemId": itemId },
          { $set: { "products.$.status": status } },
          { new: true }
      );

      if (!project) {
          return res.status(404).json({ message: "מוצר לא נמצא" });
      }

      res.json({ message: "סטטוס המוצר עודכן בהצלחה", project });
  } catch (error) {
      console.error("שגיאה בעדכון סטטוס המוצר:", error);
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

// Get project details by projectId
router.get('/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
      // בדיקה שה-ID הוא תקין בפורמט ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
          return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await Project.findById(projectId).populate('products.productId', '_id name image pricePerMeter');

      if (!project) {
          return res.status(404).json({ message: "Project not found" });
      }

      res.json(project); // מחזיר את פרטי הפרויקט
  } catch (error) {
      console.error("Error fetching project details:", error);
      res.status(500).json({ message: "Failed to fetch project details" });
  }
});




module.exports = router;