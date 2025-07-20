import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { JWT_SECRET } from '../config.js'; 

const router = express.Router();

// Fetch all transactions for a user
router.get('/transactions', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        const query = `SELECT * FROM expenses WHERE user_id = ?`;
        db.all(query, [userId], (err, transactions) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ transactions });
        });
    });
});

// Add Expense transaction and update budget
router.post('/add-transaction', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { type, category, amount, description, date } = req.body;

        // If the transaction is an expense, check if the budget exists
        if (type === 'expense') {
            const query = `SELECT amount FROM budgets WHERE category = ? AND user_id = ?`;
            db.get(query, [category, userId], (err, budget) => {
                if (err) return res.status(500).json({ error: err.message });

                if (!budget) {
                    return res.status(404).json({ error: 'Please first set budget for this category' });
                }

                // Check if the expense exceeds the remaining budget
                if (budget.amount < amount) {
                    return res.status(400).json({ error: 'You have exceeded your budget for this category' });
                }

                // Deduct the amount from the budget
                const newAmount = budget.amount - amount;
                const updateBudgetQuery = `UPDATE budgets SET amount = ? WHERE category = ? AND user_id = ?`;

                db.run(updateBudgetQuery, [newAmount, category, userId], (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Add the expense transaction to the database, including category
                const query = `INSERT INTO expenses (user_id, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)`;
                db.run(query, [userId, type, category, amount, description, date], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: 'Transaction added successfully' });
                });
                });
            });
        } else {
            // If the transaction is an income, no need to check the budget
            const query = `INSERT INTO expenses (user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [userId, type, amount, description, date], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Transaction added successfully' });
            });
        }
    });
});

//Get Recent Transactions
router.get('/recent-transactions', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        // Fetch recent transactions
        const query = `
            SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 5
        `;
        db.all(query, [userId], (err, transactions) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({ transactions });
        });
    });
});

// Get a single transaction by ID
router.get('/transaction/:id', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { id } = req.params;

        const query = `SELECT * FROM expenses WHERE id = ? AND user_id = ?`;
        db.get(query, [id, userId], (err, transaction) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ transaction });
        });
    });
});



// Edit Transaction route
router.put('/edit-transaction/:id', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { type, description, amount, date } = req.body;
        const { id } = req.params;

        const query = `UPDATE expenses SET type = ?, description = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?`;
        db.run(query, [type, description, amount, date, id, userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ message: 'Transaction updated successfully' });
        });
    });
});

// Delete Transaction route
router.delete('/delete-transaction/:id', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;
        const { id } = req.params;

        const query = `DELETE FROM expenses WHERE id = ? AND user_id = ?`;
        db.run(query, [id, userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json({ message: 'Transaction deleted successfully' });
        });
    });
});

export default router;
