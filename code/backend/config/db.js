// written by: Chan Nirak Choun
// tested by: Chan Nirak Choun
// debugged by: Chan Nirak Choun

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1); // Exit with failure
    }
  }
};

export default connectDB;