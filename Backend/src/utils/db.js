import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!mongoUrl) {
      console.warn("Mongo URL not found. API will run in limited mode until MONGO_URL or MONGO_URI is configured.");
      return null;
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const connect = await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 0),
    });

    console.log(`MongoDB connected: ${connect.connection.host}`);
    return connect.connection;
  } catch (err) {
    console.error("MongoDB error:", err.message);
    if (process.env.VERCEL === "1") {
      throw err;
    }
    console.warn("Continuing without MongoDB. Database-backed endpoints will return a fast unavailable response until the connection is restored.");
    return null;
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const getDbState = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

export default connectDB;
