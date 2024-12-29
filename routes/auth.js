const express = require('express'); // ספריה ליצירת מסלולים וניהול בקשות
const nodemailer = require('nodemailer'); //מאפשרת שליחת מיילים
const bcrypt = require('bcryptjs'); // הצפנת סיסמאות
const jwt = require('jsonwebtoken'); // משמש ליצירת עבור אימות משתמשים
const User = require('../models/user'); // מודל המשתמש המייצג את המבנה של המשתמשים בבסיס הנתונים
const { verifyToken, verifyAdmin } = require('./authMiddleware');


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


// מסלול התחברות
router.post('/login', async (req, res) => {
    console.log('Request body:', req.body);
    // בודק אם האימייל וסיסמה נשלחו בבקשה 
    const { email, password } = req.body;

    // אם המשתמש לא הזין אימייל או סיסמה או שניהם אז שגיאה
    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // מחפש לפי אימייל ב MONGODB
        console.log('Searching for user...');
        const user = await User.findOne({ email });
        // אם לא קיים , מחזיר שגיאה 
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // השוואת הסיסמה שנשלחה עם הסיסמה המוצפנת 
        console.log('Comparing passwords...');
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log('Invalid password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        // אם הסיסמה נכונה 
        console.log('Generating JWT token...');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

       
        
        console.log('Login successful');
        console.log('User email:', user.email);

        // נוסיף את שם המשתמש לתגובה
        res.status(200).json({ 
            token, 
            accountType: user.accountType,
            username: user.username, // הוספת שם המשתמש
            Useremail: user.email,
            gender: user.gender

        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // בדוק לפי אימייל אם המשתמש קיים
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // יצירת טוקן לאיפוס סיסמה עם תוקף של שעה 
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // שליחת אימייל למשתמש עם קישור לאיפוס סיסמה הכולל את הטוקן
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // המייל שלך
                pass: process.env.EMAIL_PASS  // הסיסמה שלך או אפליקיישן פאס
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click the link below to reset your password:</p>
                   <a href="http://localhost:3000/reset-password.html?token=${resetToken}">Reset Password</a>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// מסלול לאיפוס סיסמה
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    
    try {
        // אימות הטוקן לוודא השוא תקין
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Invalid or expired token' });
    }
});

// מסלול לעדכון פרטי המשתמש (שם או אימייל)
router.put('/update', verifyToken, async (req, res) => {
    const { field, value } = req.body; // השדה והערך החדש
    const allowedFields = ['username', 'email']; // שדות מותרים לעדכון

    try {
        // בדיקה אם השדה חוקי
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: 'Invalid field for update' });
        }

        // מציאת המשתמש על פי הטוקן
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // עדכון השדה המתאים
        user[field] = value;
        await user.save();

        res.status(200).json({ 
            message: `${field} updated successfully`,
            updatedField: field,
            updatedValue: value
        });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;