const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const createAdmins = async () => {
    const admins = [
        { username: 'bashar', email: 'bashar.abadi0@gmail.com', password: 'bashar123', gender: 'Male', accountType: 'Admin' },
        { username: 'ahmad', email: 'akhras018@gmail.com', password: 'ahmad123', gender: 'Female', accountType: 'Admin' },
        { username: 'ismael', email: 'ismaelbadran63@gmail.com', password: 'ismael123', gender: 'Male', accountType: 'Admin' },
        { username: 'mohamed', email: 'mhmdslah212@outlook.com', password: 'mohamed123', gender: 'Female', accountType: 'Admin' },
    ];

    try {
        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 12);
            const newAdmin = new User({ ...admin, password: hashedPassword });
            await newAdmin.save();
            console.log(`Admin ${admin.username} created.`);
        }
        console.log('All Admin users created successfully!');
        process.exit();
    } catch (err) {
        console.error('Error creating Admin users:', err);
        process.exit(1);
    }
};

createAdmins();
