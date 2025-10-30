import request from 'supertest';
import mongoose from 'mongoose';
import { app, server } from '../../code/backend/server.js';
import User from '../../code/backend/models/userModel.js';
import Ticket from '../../code/backend/models/ticketModel.js';

let customerCookie, agentCookie, adminCookie;
let customerId, agentId, adminId;

// Database Setup
beforeAll(async () => {
    // Connect to a separate test database
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ticketingTestDB_UserTicket';
    await mongoose.connect(testMongoUri);

    // Create users & get cookies
    const customer = await User.create({ name: 'Test Customer', email: 'customer.ut@test.com', password: 'password123', role: 'Customer' });
    const agent = await User.create({ name: 'Test Agent', email: 'agent.ut@test.com', password: 'password123', role: 'Agent' });
    const admin = await User.create({ name: 'Test Admin', email: 'admin.ut@test.com', password: 'password123', role: 'Admin' });
    customerId = customer._id; agentId = agent._id; adminId = admin._id;
    
    // Helper function to log in and get the cookie
    const login = async (email, pass) => (await request(app).post('/api/auth/login').send({ email, password: pass })).headers['set-cookie'];
    
    customerCookie = await login('customer.ut@test.com', 'password123');
    agentCookie = await login('agent.ut@test.com', 'password123');
    adminCookie = await login('admin.ut@test.com', 'password123');
});

// Clear ticket data after each test
afterEach(async () => {
    await Ticket.deleteMany({});
});

// Clean up database and close server after all tests
afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    await new Promise(resolve => server.close(resolve));
});

describe('Integration Tests - User Profile & Tickets', () => {

    // User Profile
    describe('User Profile Routes (/api/users/profile)', () => {
        
        it('GET /profile - should get logged-in user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Cookie', customerCookie) // Use customer's cookie
                .expect(200);

            expect(res.body.email).toBe('customer.ut@test.com');
            expect(res.body.role).toBe('Customer');
        });

        it('PUT /profile - should update logged-in user profile', async () => {
            const updates = { name: 'Updated Customer Name' };
            const res = await request(app)
                .put('/api/users/profile')
                .set('Cookie', customerCookie) // Use customer's cookie
                .send(updates)
                .expect(200);

            expect(res.body.name).toBe('Updated Customer Name');
            
            // Verify change in the database
            const dbUser = await User.findById(customerId);
            expect(dbUser.name).toBe('Updated Customer Name');
        });

        it('PUT /profile - should fail if not authenticated', async () => {
            await request(app)
                .put('/api/users/profile')
                .send({ name: 'New Name' })
                .expect(401); // Unauthorized
        });
    });

    // Admin User Management
    describe('Admin User Routes (/api/users)', () => {
        it('GET / - Admin should get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Cookie', adminCookie)
                .expect(200);
            expect(response.body.length).toBeGreaterThanOrEqual(3); // Should see customer, agent, admin
            expect(response.body[0]).not.toHaveProperty('password');
        });

        it('GET / - Non-admin should get 403', async () => {
            await request(app).get('/api/users').set('Cookie', customerCookie).expect(403);
            await request(app).get('/api/users').set('Cookie', agentCookie).expect(403);
        });

        it('POST / - Admin should create a new Agent user', async () => {
            const newAgent = { name: 'New Agent', email: 'new.agent@test.com', password: 'password123', role: 'Agent' };
            const response = await request(app)
                .post('/api/users')
                .set('Cookie', adminCookie)
                .send(newAgent)
                .expect(201);
            expect(response.body.role).toBe('Agent');
            const dbUser = await User.findOne({ email: 'new.agent@test.com' });
            expect(dbUser).not.toBeNull();
        });

        it('POST / - Non-admin should get 403 when trying to create user', async () => {
             const newUser = { name: 'Hacker', email: 'hacker@test.com', password: 'password123', role: 'Admin' };
             await request(app).post('/api/users').set('Cookie', customerCookie).send(newUser).expect(403);
             await request(app).post('/api/users').set('Cookie', agentCookie).send(newUser).expect(403);
        });
    });

    // Ticket Lifecycle
    describe('Ticket Routes (/api/tickets)', () => {
        let testTicketId;

        // Run this before each test in this "Ticket Routes" block
        beforeEach(async () => {
            // Create a ticket as the customer
            const newTicket = { title: 'Test Ticket', description: 'Desc', priority: 'Medium' };
            const response = await request(app)
                .post('/api/tickets')
                .set('Cookie', customerCookie)
                .send(newTicket)
                .expect(201);
            testTicketId = response.body._id; // Save for later tests
        });

        it('POST / - Customer should create a ticket', async () => {
            // This test case is technically handled in the beforeEach,
            // but we can assert its properties here.
            const ticket = await Ticket.findById(testTicketId);
            expect(ticket).not.toBeNull();
            expect(ticket.status).toBe('Open');
            expect(ticket.customer.toString()).toBe(customerId.toString());
        });

        it('GET / - Customer should see only their ticket', async () => {
            // Create another ticket by a different user (e.g., admin)
            await Ticket.create({ customer: adminId, title: 'Admin Ticket', description: 'Admin Desc'});
            
            const response = await request(app)
                .get('/api/tickets')
                .set('Cookie', customerCookie)
                .expect(200);

            expect(response.body).toHaveLength(1); // Should only see their own ticket
            expect(response.body[0]._id.toString()).toBe(testTicketId.toString());
        });

        it('GET /:id - Customer should get their own ticket details', async () => {
             const response = await request(app)
                .get(`/api/tickets/${testTicketId}`)
                .set('Cookie', customerCookie)
                .expect(200);
             expect(response.body.title).toBe('Test Ticket');
        });

         it('GET /:id - Customer should get 403 for another user ticket', async () => {
            const otherTicket = await Ticket.create({ customer: agentId, title: 'Other Ticket', description: 'Other Desc'});
            await request(app)
                .get(`/api/tickets/${otherTicket._id}`)
                .set('Cookie', customerCookie)
                .expect(403); // Forbidden
        });

        it('PUT /:id - Admin should assign the ticket to an Agent', async () => {
            const response = await request(app)
                .put(`/api/tickets/${testTicketId}`)
                .set('Cookie', adminCookie)
                .send({ agentId: agentId })
                .expect(200);
            expect(response.body.agent.toString()).toBe(agentId.toString());
        });

        it('PUT /:id - Agent should update the status of their assigned ticket', async () => {
            // First, assign the ticket
            await Ticket.findByIdAndUpdate(testTicketId, { agent: agentId });

            const response = await request(app)
                .put(`/api/tickets/${testTicketId}`)
                .set('Cookie', agentCookie) // Authenticate as agent
                .send({ status: 'In Progress' })
                .expect(200);
            expect(response.body.status).toBe('In Progress');
        });

         it('PUT /:id - Customer should get 403 when trying to update status', async () => {
            await request(app)
                .put(`/api/tickets/${testTicketId}`)
                .set('Cookie', customerCookie)
                .send({ status: 'Closed' })
                .expect(403); // Forbidden
        });

        it('POST /:id/comments - Any authenticated user should add a comment', async () => {
            const commentText = 'This is a test comment from the customer.';
            const response = await request(app)
                .post(`/api/tickets/${testTicketId}/comments`)
                .set('Cookie', customerCookie) // Customer adds comment
                .send({ text: commentText })
                .expect(201);
            expect(response.body.text).toBe(commentText);
            expect(response.body.author.name).toBe('Test Customer');

            // Verify comment is added to ticket in DB
            const ticket = await Ticket.findById(testTicketId);
            expect(ticket.comments).toHaveLength(1);
            expect(ticket.comments[0].toString()).toBe(response.body._id.toString());
        });
    });
});