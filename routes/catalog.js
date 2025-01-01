const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const CatalogItem = require("../models/CatalogItem");

// Get all catalog items
router.get("/", async (req, res) => {
  try {
    const items = await CatalogItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching catalog items" });
  }
});


// Delete an item
router.delete("/:id", async (req, res) => {
  try {
    const item = await CatalogItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting catalog item" });
  }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});


const upload = multer({ storage });

// Add a new catalog item with an image
router.post("/", upload.single("image"), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    try {
        const { name, description, pricePerMeter, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !description || !pricePerMeter || !category || !image) {
            return res.status(400).json({ error: "All fields are required, including an image." });
        }

        const newItem = new CatalogItem({ name, description, pricePerMeter, category, image });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: "Error adding catalog item." });
    }
});

router.use("/uploads", express.static("uploads"));

module.exports = router;
