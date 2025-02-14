import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }

    await mongoose.connect(process.env.MONGODB_URI);
    return mongoose.connection.asPromise();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};