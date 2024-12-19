const express = require('express'); // ספריה ליצירת מסלולים וניהול בקשות
const nodemailer = require('nodemailer'); //מאפשרת שליחת מיילים
const bcrypt = require('bcryptjs'); // הצפנת סיסמאות
const jwt = require('jsonwebtoken'); // משמש ליצירת עבור אימות משתמשים
const User = require('../models/user'); // מודל המשתמש המייצג את המבנה של המשתמשים בבסיס הנתונים


// יוצר אובייקט שמאפשר להגדיר מסלולים בצורה מאורגנת ונפרדת מהקובץ הראשי
const router = express.Router();



// מסלול להרשמה ללקוח CUSTOMER
router.post('/signup/customer', async (req, res) => {
    //שולף מהבקשה את הנתונים שם משתמש , אימייל ...  
    const { username, email, password, gender } = req.body;

    try {
        // מצפין את הסיסמה
        const hashedPassword = await bcrypt.hash(password, 12);
        // יצירת אובייקט משתמש חדש עם הנתונים ומסמן את סוג החשבון
        const user = new User({ username, email, password: hashedPassword, gender, accountType: 'Customer' });
        // שומר את המשתמש ב MONGODB
        await user.save();
        // מחזיר תשובה ללקוח עם סטטוס 201 הצלחה
        res.status(201).json({ message: 'Customer account created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating customer account' });
    }
});















// Contractor Sign-Up
router.post('/signup/contractor', async (req, res) => {
    const { username, email, password, gender } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ username, email, password: hashedPassword, gender, accountType: 'Contractor' });
        await user.save();
        res.status(201).json({ message: 'Contractor account created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating contractor account' });
    }
});




module.exports = router;