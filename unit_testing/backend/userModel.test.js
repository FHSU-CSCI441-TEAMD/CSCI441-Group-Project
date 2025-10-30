import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../code/backend/models/userModel.js';

jest.mock('bcryptjs');

describe('User Model - Unit Tests', () => {

  it('matchPassword should return true for a correct password', async () => {
    const user = new User({ password: 'hashedPasswordFromDB' });
    bcrypt.compare.mockResolvedValue(true); // Simulate successful comparison

    const isMatch = await user.matchPassword('plainPasswordAttempt');

    expect(isMatch).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPasswordAttempt', 'hashedPasswordFromDB');
  });

  it('matchPassword should return false for an incorrect password', async () => {
    const user = new User({ password: 'hashedPasswordFromDB' });
    bcrypt.compare.mockResolvedValue(false); // Simulate failed comparison

    const isMatch = await user.matchPassword('wrongPasswordAttempt');

    expect(isMatch).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPasswordAttempt', 'hashedPasswordFromDB');
  });
});