const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/auth"); // חיבור לנתיבי האימות



dotenv.config();

const app = express();

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