const request = require('supertest');
const app = require('../backend/server');  

describe('Transaction Tests', () => {

    let validToken;  // Store the token for further use

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: 'test@gmail.com', password: '123' });
        validToken = loginResponse.body.token;  // Extract token for future requests
    });

    // Test case 1: Add income to make sure the budget is based on income
    it('should add an income transaction', async () => {
        const newIncomeTransaction = {
            type: 'income',
            category: 'Food',
            amount: 5000,  // Add income of 500
            description: 'Salary',
            date: '2025-07-20',
        };

        const incomeResponse = await request(app)
            .post('/transactions/add-transaction')
            .set('Authorization', `Bearer ${validToken}`)
            .send(newIncomeTransaction)
            .expect(201);

        expect(incomeResponse.body.message).toBe('Transaction added successfully');
    });

    // Test case 2:  Set a budget for the "food" category
    it('should set a budget for the "food" category', async () => {
        const setBudgetResponse = await request(app)
            .post('/budget/set-budget')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                category: 'food',
                budgetAmount: 100,  // Set a budget of 100 for food
            })
            .expect(201);

        expect(setBudgetResponse.body.message).toBe('Budget set successfully');
    });

    // Test case 3:  Add an expense transaction successfully within the budget
    it('should add an expense transaction successfully', async () => {
        const newTransaction = {
            type: 'expense',
            category: 'food',
            amount: 50,
            description: 'Groceries',
            date: '2025-07-20',
        };

        const response = await request(app)
            .post('/transactions/add-transaction')
            .set('Authorization', `Bearer ${validToken}`)
            .send(newTransaction)
            .expect(201);

        expect(response.body.message).toBe('Transaction added successfully');
    });

    // Test case :4 Try to add an expense transaction that exceeds the budget
    it('should not add an expense if it exceeds the budget', async () => {
        const newTransaction = {
            type: 'expense',
            category: 'food',
            amount: 5000,  // This exceeds the budget of 100 for food
            description: 'Groceries',
            date: '2025-07-20',
        };

        const response = await request(app)
            .post('/transactions/add-transaction')
            .set('Authorization', `Bearer ${validToken}`)
            .send(newTransaction)
            .expect(400);

        expect(response.body.error).toBe('You have exceeded your budget for this category');
    });

    // Test case 5: Get All Transactions for a User
    it('should fetch all transactions for a user', async () => {
        const response = await request(app)
            .get('/transactions/transactions')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body.transactions).toBeInstanceOf(Array);
        expect(response.body.transactions.length).toBeGreaterThan(0);
    });

    // Test case 6: New Test Case 3: Get Recent Transactions
    it('should fetch recent transactions', async () => {
        const response = await request(app)
            .get('/transactions/recent-transactions')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);

        expect(response.body.transactions).toBeInstanceOf(Array);
        expect(response.body.transactions.length).toBeLessThanOrEqual(5);
    });

    //Test Case 7: Attempt to Delete Non-Existent Transaction
    it('should return an error when trying to delete a non-existent transaction', async () => {
        const response = await request(app)
            .delete('/transactions/delete-transaction/9999') // Assuming 9999 is a non-existent ID
            .set('Authorization', `Bearer ${validToken}`)
            .expect(404);

        expect(response.body.error).toBe('Transaction not found');
    });

    //Test case 8:  Invalid Token Handling
    it('should return an error for invalid token', async () => {
        const response = await request(app)
            .get('/transactions/transactions')
            .set('Authorization', 'Bearer invalidtoken')
            .expect(403);

        expect(response.body.error).toBe('Invalid token');
    });

    //Test case 9: No Token Provided
    it('should return an error if no token is provided', async () => {
        const response = await request(app)
            .get('/transactions/transactions')
            .expect(403);

        expect(response.body.error).toBe('No token provided');
    });
});

