import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { JWT_SECRET } from '../config.js'; 

const router = express.Router();

// Get financial report

router.get('/get-financial-reports', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        // Get Total Income (from income transactions)
        const incomeQuery = `
            SELECT SUM(amount) AS total_income FROM expenses WHERE user_id = ? AND type = 'income'
        `;
        db.get(incomeQuery, [userId], (err, incomeResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalIncome = incomeResult.total_income || 0;

            // Get Total Expenses (from all expense transactions, regardless of category)
            const expenseQuery = `
                SELECT SUM(amount) AS total_expenses
                FROM expenses
                WHERE user_id = ? AND type = 'expense'
            `;
            db.get(expenseQuery, [userId], (err, expenseResult) => {
                if (err) return res.status(500).json({ error: err.message });

                const totalExpenses = expenseResult.total_expenses || 0;

                // Calculate total savings
                const totalSavings = totalIncome - totalExpenses;

                // Get Expenses for specific categories (Food and Entertainment)
                const categoryExpensesQuery = `
                    SELECT e.category, SUM(e.amount) AS total_expenses
                    FROM expenses e
                    WHERE e.user_id = ? AND e.type = 'expense' AND (e.category = 'food' OR e.category = 'entertainment')
                    GROUP BY e.category
                `;
                db.all(categoryExpensesQuery, [userId], (err, categoryExpensesResult) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Ensure that category is found and assigned correctly
                    const foodExpenses = categoryExpensesResult.find(exp => exp.category === 'food')?.total_expenses || 0;
                    const entertainmentExpenses = categoryExpensesResult.find(exp => exp.category === 'entertainment')?.total_expenses || 0;

                    // Construct report data
                    const reportData = {
                        totalSavings,
                        totalIncome,
                        foodExpenses,
                        entertainmentExpenses,
                    };

                    res.status(200).json(reportData);
                });
            });
        });
    });
});

export default router;
