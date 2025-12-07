import request from 'supertest';
import mongoose from 'mongoose';
import { app, server } from '../../code/backend/server.js';
import User from '../../code/backend/models/userModel.js';
import Ticket from '../../code/backend/models/ticketModel.js';
import { connect, close } from './test-db-setup.js';

jest.setTimeout(60000);

let adminCookie;
let customerId, agentId, adminId;

// Database Setup
beforeAll(async () => {
    await connect();

    // Create users & get admin cookie
    const customer = await User.create({ name: 'Report Customer', email: 'customer.report@test.com', password: 'password123', role: 'Customer' });
    const agent = await User.create({ name: 'Report Agent', email: 'agent.report@test.com', password: 'password123', role: 'Agent' });
    const admin = await User.create({ name: 'Report Admin', email: 'admin.report@test.com', password: 'password123', role: 'Admin' });
    customerId = customer._id; agentId = agent._id; adminId = admin._id;
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'admin.report@test.com', password: 'password123' });
    adminCookie = loginRes.headers['set-cookie'];

    // Create some tickets
    await Ticket.create({ customer: customerId, title: 'Open Ticket 1', description: 'Desc', status: 'Open' });
    await Ticket.create({ customer: customerId, title: 'Open Ticket 2', description: 'Desc', status: 'Open' });
    await Ticket.create({ customer: adminId, title: 'In Prog Ticket', description: 'Desc', status: 'In Progress', agent: agentId });
    await Ticket.create({ customer: customerId, title: 'Resolved Ticket', description: 'Desc', status: 'Resolved', agent: agentId });
});

afterAll(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await close();
    await new Promise(resolve => server.close(resolve));
});

describe('Integration Tests - Report Routes (/api/reports)', () => {

    describe('GET /tickets', () => {
        it('should return aggregated report for Admin', async () => {
            const response = await request(app)
                .get('/api/reports/tickets')
                .set('Cookie', adminCookie)
                .expect(200);

            expect(response.body).toHaveProperty('totalTickets', 4);
            expect(response.body).toHaveProperty('report');
            expect(response.body.report).toBeInstanceOf(Array);

            // Check if specific statuses are present (order might vary due to sort)
            const openGroup = response.body.report.find(item => item._id === 'Open');
            const inProgGroup = response.body.report.find(item => item._id === 'In Progress');
            const resolvedGroup = response.body.report.find(item => item._id === 'Resolved');

            expect(openGroup).toBeDefined();
            expect(openGroup.count).toBe(2);
            expect(inProgGroup).toBeDefined();
            expect(inProgGroup.count).toBe(1);
            expect(resolvedGroup).toBeDefined();
            expect(resolvedGroup.count).toBe(1);
        });

        it('should return filtered report by status for Admin', async () => {
             const response = await request(app)
                .get('/api/reports/tickets?status=Open') // Filter for Open tickets
                .set('Cookie', adminCookie)
                .expect(200);

             expect(response.body).toHaveProperty('totalTickets', 2);
             expect(response.body.report).toHaveLength(1);
             expect(response.body.report[0]._id).toBe('Open');
             expect(response.body.report[0].count).toBe(2);
        });

         it('should return filtered report by agent for Admin', async () => {
             const response = await request(app)
                .get(`/api/reports/tickets?agentId=${agentId}`) // Filter by Agent ID
                .set('Cookie', adminCookie)
                .expect(200);

             expect(response.body).toHaveProperty('totalTickets', 2); // In Progress and Resolved tickets
             const inProgGroup = response.body.report.find(item => item._id === 'In Progress');
             const resolvedGroup = response.body.report.find(item => item._id === 'Resolved');
             expect(inProgGroup.count).toBe(1);
             expect(resolvedGroup.count).toBe(1);
        });

        it('should return 403 for non-Admin users', async () => {
            // Login as customer first to get cookie
            const custLogin = await request(app).post('/api/auth/login').send({ email: 'customer.report@test.com', password: 'password123' });
            const custCookie = custLogin.headers['set-cookie'];

            await request(app)
                .get('/api/reports/tickets')
                .set('Cookie', custCookie)
                .expect(403); // Forbidden
        });
    });
});