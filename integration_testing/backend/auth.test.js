import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { app, server } from '../../code/backend/server.js';
import User from '../../code/backend/models/userModel.js';
import Token from '../../code/backend/models/tokenModel.js';
import { sendPasswordResetEmail } from '../../code/backend/services/emailService.js';
import { connect, close } from './test-db-setup.js';

// Mock the Email Service
jest.mock('../../code/backend/services/emailService.js', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Database Setup
beforeAll(async () => {
    await connect();
}, 60000);

afterEach(async () => {
    await User.deleteMany({});
    await Token.deleteMany({});
});

afterAll(async () => {
    await close();
    await new Promise(resolve => server.close(resolve));
});

describe('Integration Tests - Auth Routes (/api/auth)', () => {

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /json/);

            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toBe('Test User');
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.role).toBe('Customer'); // Verifies default role
            expect(res.headers['set-cookie']).toBeDefined(); // Verifies a cookie was set
        });

        it('should fail if email already exists', async () => {
            // 1. Create the first user
            await User.create({ name: 'User One', email: 'duplicate@example.com', password: 'password123' });

            // 2. Try to register with the same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'User Two', email: 'duplicate@example.com', password: 'password456' })
                .expect(400); // Bad Request

            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            // Create a user to log in with
            await User.create({ name: 'Login User', email: 'login@example.com', password: 'password123' });
        });

        it('should log in a user with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com', password: 'password123' })
                .expect(200);

            expect(res.body.email).toBe('login@example.com');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should fail login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com', password: 'wrongpassword' })
                .expect(401); // Unauthorized

            expect(res.body.message).toBe('Invalid email or password');
            expect(res.headers['set-cookie']).toBeUndefined();
        });
    });

    describe('POST /logout', () => {
        it('should log out a user by clearing the cookie', async () => {
            // 1. Register and Login first to get a cookie
            await request(app).post('/api/auth/register').send({ name: 'Logout Test', email: 'logout@test.com', password: 'password123' });
            const loginRes = await request(app).post('/api/auth/login').send({ email: 'logout@test.com', password: 'password123' });
            const cookie = loginRes.headers['set-cookie'];

            // 2. Call logout
            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', cookie) // Send the cookie back
                .expect(200);

            // 3. Check if the cookie is cleared in the response
            expect(logoutRes.headers['set-cookie'][0]).toContain('jwt=;'); // Check for empty jwt value
            expect(logoutRes.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970'); // Check for past expiry
        });
    });

    describe('POST /forgot-password', () => {
        beforeEach(async () => {
            // Create a user to send the request for
            await User.create({ name: 'Forgot User', email: 'forgot@example.com', password: 'password123' });
            // Reset mock call count before each test
            sendPasswordResetEmail.mockClear();
        });

        it('should send a password reset email and create a token', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'forgot@example.com' })
                .expect(200);

            expect(res.body.message).toBe('Password reset email sent.');
            
            // Check that our mock email service was called
            expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
            
            // Check that a token was actually created in the database
            const user = await User.findOne({ email: 'forgot@example.com' });
            const token = await Token.findOne({ userId: user._id });
            expect(token).not.toBeNull();
        });
    });

    describe('POST /reset-password/:token', () => {
        let user;
        let unhashedToken;
        let hashedToken;

        beforeEach(async () => {
            // 1. Create a user
            user = await User.create({ name: 'Reset User', email: 'reset@example.com', password: 'password123' });
            
            // 2. Manually create a reset token
            unhashedToken = crypto.randomBytes(32).toString('hex');
            hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
            
            await new Token({
                userId: user._id,
                token: hashedToken,
            }).save();
        });

        it('should reset the password successfully with a valid token', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${unhashedToken}`) // Use the unhashed token in the URL
                .send({ password: 'newSecurePassword' })
                .expect(200);

            expect(res.body.message).toBe('Password reset successful');

            // 3. Verify the token was deleted
            const tokenInDb = await Token.findOne({ token: hashedToken });
            expect(tokenInDb).toBeNull();

            // 4. Verify the user can log in with the new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'reset@example.com', password: 'newSecurePassword' })
                .expect(200);
                
            expect(loginRes.body.email).toBe('reset@example.com');
        });

        it('should fail with an invalid or expired token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password/invalidfakejtoken')
                .send({ password: 'newpassword' })
                .expect(400);

            expect(res.body.message).toBe('Invalid or expired token');
        });
    });
});