// written by: Nirak & Jakob
// tested by: Nirak & Jakob
// debugged by: Nirak & Jakob

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';

dotenv.config();

await connectDB();

const importData = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });

    if (adminExists) {
      console.log('Admin user already exists. Seeder skipped.');
      process.exit();
    }

    console.log('No Admin user found. Creating new admin...');
    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'Admin',
    });

    console.log('Default Admin user created successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();