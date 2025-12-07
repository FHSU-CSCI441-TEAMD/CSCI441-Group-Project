// written by: Nirak & Jakob
// tested by: Nirak & Jakob
// debugged by: Nirak & Jakob

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test_secret';

let mongoServer;

export const connect = async () => {
  // Prevent MongooseError: Can't call `openUri()` on an active connection with different connection strings
  await mongoose.disconnect();
  
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const close = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
