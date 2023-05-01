const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

// Authenticate the user and return the user object if successful
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Logging in:', { username, password }); // Add this line

        const user = await User.findOne({ username, password });

        console.log('Found user:', user); // Add this line

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ ...user._doc, token });
    } catch (err) {
        console.error('Error in /auth/login:', err); // Add this line
        res.status(500).json({ error: err.message });
    }
});

// Create a new voting category
router.post('/categories', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the latest voting category
router.get('/categories/latest', async (req, res) => {
    try {
        const category = await Category.findOne().sort({ _id: -1 });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a vote for a specific category
router.post('/categories/:id/vote', authenticate, async (req, res) => {
    try {
        const { userId, option } = req.body;

        console.log('userId:', userId);

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        console.log('category.votes:', category.votes);

        // Check if the user has already voted
        const existingVote = category.votes.find((vote) => vote.user.toString() === userId);

        console.log('existingVote:', existingVote);

        if (existingVote) {
            return res.status(403).json({ error: 'You have already voted for this category' });
        }

        category.votes.push({ user: userId, option });
        await category.save();

        res.status(201).json({ message: 'Vote submitted successfully' });
    } catch (err) {
        console.log('Error in /categories/:id/vote:', err); // Add this line
        res.status(500).json({ error: err.message });
    }
});

// Get all voting categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        console.log('Sending categories:', categories); // Add this line
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a specific category
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Close votes for a specific category
router.patch('/categories/:id/close', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { isClosed: true }, { new: true });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;