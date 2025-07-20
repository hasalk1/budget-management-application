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

      // Add income to make sure the budget is based on income
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


    // First, set a budget for the "food" category
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

  
    // Now test if the expense can be added successfully (within the budget)
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

    // Now test if the expense exceeds the budget
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
});
