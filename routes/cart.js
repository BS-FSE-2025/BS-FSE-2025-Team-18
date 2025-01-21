const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

router.use(express.json());

// קבלת עגלה לפי דוא"ל
// Get cart by email
// קבלת עגלה לפי דוא"ל
router.get('/:email', async (req, res) => {
    try {
        const cart = await Cart.findOne({ email: req.params.email }).populate('items.productId');

        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        // בדיקה אם הפריטים עדיין קיימים בקטלוג
        const validItems = [];
        for (const item of cart.items) {
            if (item.productId) { // רק פריטים שעדיין קיימים בקטלוג
                validItems.push(item);
            }
        }

        // עדכון העגלה אם יש פריטים לא קיימים
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart', error });
    }
});


// הוספה או עדכון פריט בעגלה
router.post('/:email', async (req, res) => {
    const { productId, price, quantity, totalPrice, status = "Pending" } = req.body;
    const email = req.params.email;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
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
            existingItem.status = status; // עדכון סטטוס
        } else {
            cart.items.push({ productId, price, quantity, totalPrice, status });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Failed to update cart', error });
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

router.patch("/:email/update-status", async (req, res) => {
    const { email } = req.params;
    const { productId, status } = req.body;

    try {
        const cart = await Cart.findOne({ email });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (item) {
            item.status = status;
            await cart.save();
            return res.status(200).json({ message: "Status updated successfully" });
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
