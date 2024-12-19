
//  הגדרת משתמש חדש ב - מונגוס שהוא ספרייה שעובדת עם - מונגודב באמצעות js
const mongoose = require('mongoose');

// הגדרת הסכימה 
const UserSchema = new mongoose.Schema({
    // הגדרת הסכימה , סוג הנתונים הוא - סתרינג וחייב להיות מוגדרים 
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    // סוג הנתונים הוא - סתרינג וגם חייב ךהיות אחד הערכים 
    accountType: { type: String, enum: ['Customer', 'Contractor', 'Admin'], required: true }
}, { timestamps: true });
// יצירת מודל על בסיס הסכמה שיצרנו
module.exports = mongoose.model('User', UserSchema);
