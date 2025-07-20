const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db.js');
const { JWT_SECRET } = require('../config.js');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(query, [name, email, hashedPassword], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error hashing password' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } catch (err) {
            return res.status(500).json({ error: 'Error comparing passwords' });
        }
    });
});

module.exports = router;
