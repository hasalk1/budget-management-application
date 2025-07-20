const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/db.js');
const { JWT_SECRET } = require('../config.js');

const router = express.Router();

// Set Budget route
router.post('/set-budget', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { category, budgetAmount } = req.body;

        // Get total income
        const incomeQuery = `SELECT SUM(amount) AS total_income FROM expenses WHERE user_id = ? AND type = 'income'`;
        db.get(incomeQuery, [userId], (err, incomeResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalIncome = incomeResult.total_income || 0;

            // Ensure the budget does not exceed the total income
            if (budgetAmount > totalIncome) {
                return res.status(400).json({ error: 'Budget cannot exceed total income' });
            }

            // Insert the new budget
            const query = `INSERT INTO budgets (category, amount, user_id) VALUES (?, ?, ?)`;
            db.run(query, [category, budgetAmount, userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Budget set successfully' });
            });
        });
    });
});

// Get current budgets
router.get('/current-budgets', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        const query = `SELECT * FROM budgets WHERE user_id = ?`;
        db.all(query, [userId], (err, budgets) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ budgets });
        });
    });
});

// Notification when the budget is about to exceed 80%
router.post('/check-budget', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { category, amount } = req.body;

        const query = `SELECT amount FROM budgets WHERE category = ? AND user_id = ?`;
        db.get(query, [category, userId], (err, budget) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!budget) return res.status(404).json({ error: 'Budget category not found' });

            // Check if the user is about to exceed their budget (80% threshold)
            const threshold = 0.8 * budget.amount;
            if (budget.amount - amount <= threshold) {
                return res.status(400).json({ error: 'Warning: You are about to exceed your budget' });
            }

            res.status(200).json({ message: 'Budget is okay to proceed' });
        });
    });
});

module.exports = router;
