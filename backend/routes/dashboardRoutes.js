import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { JWT_SECRET } from '../config.js'; 

const router = express.Router();


// Get Dashboard Summary
router.get('/dashboard-summary', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        // Calculate Total Income
        const incomeQuery = `SELECT SUM(amount) AS total_income FROM expenses WHERE user_id = ? AND type = 'income'`;
        db.get(incomeQuery, [userId], (err, incomeResult) => {
            if (err) return res.status(500).json({ error: err.message });

            // Calculate Total Expenses
            const expenseQuery = `SELECT SUM(amount) AS total_expenses FROM expenses WHERE user_id = ? AND type = 'expense'`;
            db.get(expenseQuery, [userId], (err, expenseResult) => {
                if (err) return res.status(500).json({ error: err.message });

                // Calculate Total Balance
                const totalBalance = (incomeResult.total_income || 0) - (expenseResult.total_expenses || 0);

                res.status(200).json({
                    totalBalance,
                    totalIncome: incomeResult.total_income || 0,
                    totalExpenses: expenseResult.total_expenses || 0,
                });
            });
        });
    });
});

// Get Recent Transactions
router.get('/transactions', (req, res) => {
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

export default router;
