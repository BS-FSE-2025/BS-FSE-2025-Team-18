const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/auth"); // חיבור לנתיבי האימות
const cors = require("cors");



dotenv.config();
const app = express();
app.use(cors());


// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("website")); // שיתוף קבצי סטטיים מהתיקייה

// חיבור למסד הנתונים
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// חיבור לנתיבי auth
app.use("/api/auth", authRoutes);

// דף ברירת מחדל
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "website", "main_page.html"))
);

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const userRoutes = require('./routes/auth'); // המסלולים שלך
app.use('/api', userRoutes); // הוספת הנתיב הבסיסי

const catalogRoutes = require("./routes/catalog");
app.use("/api/catalog", catalogRoutes); // Add catalog routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const projectRoutes = require("./routes/projects"); // חיבור לנתיב projects
app.use("/api/projects", projectRoutes); // הוספת הנתיב




app.post('/api/save-checklist', async (req, res) => {
  const { userId, tasks } = req.body;

  console.log('Request received:', { userId, tasks }); // Debug log

  if (!userId || !tasks) {
    console.error('Validation Error: Missing userId or tasks');
    return res.status(400).send('User ID and tasks are required');
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { tasks: tasks || [] }, // Update the tasks field
      { new: true } // Return the updated document
    );

    if (!user) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    console.log('Checklist updated for user:', user);
    res.status(200).send('Checklist saved successfully');
  } catch (error) {
    console.error('Error saving checklist:', error.message); // Log the exact error
    res.status(500).send('Error saving checklist');
  }
});

app.get('/api/get-checklist/:userId', async (req, res) => {
  const { userId } = req.params;

  console.log('Fetching checklist for userId:', userId); // Debug log

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    console.log('Checklist fetched:', user.tasks); // Debug log
    res.status(200).json(user.tasks);
  } catch (error) {
    console.error('Error fetching checklist:', error); // Log the exact error
    res.status(500).send('Error fetching checklist');
  }
});
app.put('/api/projects/:projectId/addProductToProject', async (req, res) => {
  const { projectId } = req.params;
  const { productId, productName, productImage, quantity } = req.body;

  try {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).send("Project not found");

      project.products.push({ productId, productName, productImage, quantity });
      await project.save();

      res.send("Product added to project successfully");
  } catch (error) {
      res.status(500).send("Failed to add product to project");
  }
});
