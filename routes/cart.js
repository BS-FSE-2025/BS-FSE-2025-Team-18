const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// קבלת עגלה לפי דוא"ל
router.get('/:email', async (req, res) => {
    try {
        const cart = await Cart.findOne({ email: req.params.email }).populate('items.productId');
        res.status(200).json(cart || { items: [] });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בטעינת עגלה', error });
    }
});

// הוספה או עדכון פריט בעגלה
router.post('/:email', async (req, res) => {
    const { productId, price, quantity, totalPrice } = req.body;
    const email = req.params.email;

    if (!email) return res.status(400).json({ message: "נדרש דוא\"ל" });

    // בדיקה אם הנתונים מגיעים כמו שצריך
    if (!productId || !price || !quantity || !totalPrice) {
        return res.status(400).json({ message: "נתונים חסרים בגוף הבקשה" });
    }

    try {
        let cart = await Cart.findOne({ email });

        if (!cart) {
            cart = new Cart({ email, items: [] });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice += totalPrice;
        } else {
            cart.items.push({ productId, price, quantity, totalPrice });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בעדכון עגלה", error });
    }
});

// הסרת פריט מעגלה
router.delete('/:email/:index', async (req, res) => {
    try {
        const cart = await Cart.findOne({ email: req.params.email });
        if (!cart) return res.status(404).json({ message: 'עגלה לא נמצאה' });

        cart.items.splice(req.params.index, 1);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בהסרת פריט', error });
    }
});

module.exports = router;
