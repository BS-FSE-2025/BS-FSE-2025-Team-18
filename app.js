const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/auth"); // חיבור לנתיבי האימות
const cors = require("cors");
const User = require("./models/user");


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





//for UsersList in the admin page.
// Endpoint to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.json(users); // Send the users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Route to serve the Users List page
app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "UsersList.html")); // Ensure the path to the HTML file is correct
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});
