const request = require('supertest');
const app = require('../backend/server');  

describe('Dashboard Tests', () => {

    let validToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: 'test@gmail.com', password: '123' });

        validToken = loginResponse.body.token;
    });

    it('should return dashboard summary with income and expenses', async () => {
        const response = await request(app)
            .get('/dashboard/dashboard-summary')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200);
        
        expect(response.body.totalBalance).toBeDefined();
        expect(response.body.totalIncome).toBeDefined();
        expect(response.body.totalExpenses).toBeDefined();
    });
});
