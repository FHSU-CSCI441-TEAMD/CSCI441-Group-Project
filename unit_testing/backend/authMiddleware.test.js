// written by: Nirak & Jakob
// tested by: Nirak & Jakob
// debugged by: Nirak & Jakob

import jwt from 'jsonwebtoken';
import User from '../../code/backend/models/userModel.js';
import { protect, admin, agentOrAdmin } from '../../code/backend/middleware/authMiddleware.js';

jest.mock('jsonwebtoken');
jest.mock('../../code/backend/models/userModel.js');

describe('Auth Middleware - Unit Tests', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockRequest = { cookies: {}, user: null };
        mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    // Tests for protect
    describe('protect middleware', () => {
        it('should call next() and attach user if token is valid', async () => {
            const mockUser = { _id: 'userId123', name: 'Test', role: 'Customer' };
            mockRequest.cookies.jwt = 'validToken';
            jwt.verify.mockReturnValue({ userId: 'userId123' });
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) }); // Mock chained select

            await protect(mockRequest, mockResponse, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
            expect(User.findById).toHaveBeenCalledWith('userId123');
            expect(mockRequest.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should return 401 if no token', async () => {
            await protect(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
            expect(mockNext).not.toHaveBeenCalled();
        });

         it('should return 401 if token is invalid', async () => {
            mockRequest.cookies.jwt = 'invalidToken';
            jwt.verify.mockImplementation(() => { throw new Error('bad token'); });

            await protect(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    // Tests for admin
    describe('admin middleware', () => {
        it('should call next() if user is Admin', () => {
            mockRequest.user = { role: 'Admin' };
            admin(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should return 403 if user is not Admin', () => {
            mockRequest.user = { role: 'Customer' };
            admin(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    // Tests for agentOrAdmin
    describe('agentOrAdmin middleware', () => {
        it('should call next() if user is Agent', () => {
            mockRequest.user = { role: 'Agent' };
            agentOrAdmin(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should call next() if user is Admin', () => {
            mockRequest.user = { role: 'Admin' };
            agentOrAdmin(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should return 403 if user is Customer', () => {
            mockRequest.user = { role: 'Customer' };
            agentOrAdmin(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authorized as an agent or admin' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});