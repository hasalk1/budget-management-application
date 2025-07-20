const request = require('supertest');
const app = require('../backend/server');  

describe('User Authentication Tests', () => {

    it('should register a new user successfully', async () => {
        const newUser = {
            name: 'Test',
            email: 'test1@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/auth/register')
            .send(newUser)
            .expect(201);
        
        expect(response.body.message).toBe('User created successfully');
    });

    it('should not register a user with missing fields', async () => {
        const newUser = {
            name: 'Test',
            email: 'test1@example.com',
            // Missing password field
        };

        const response = await request(app)
            .post('/auth/register')
            .send(newUser)
            .expect(400);

        expect(response.body.error).toBe('Missing required fields');
    });

    it('should log in a registered user successfully', async () => {
        const loginUser = {
            email: 'test1@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/auth/login')
            .send(loginUser)
            .expect(200);
        
        expect(response.body.message).toBe('Login successful');
    });

    it('should return error for incorrect login details', async () => {
        const loginUser = {
            email: 'test1@example.com',
            password: 'wrongpassword',
        };

        const response = await request(app)
            .post('/auth/login')
            .send(loginUser)
            .expect(401);

        expect(response.body.error).toBe('Incorrect password');
    });
});
