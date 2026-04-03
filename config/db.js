import mongoose from "mongoose";
import Sentry from "./instrument.js";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017";
  const isServerless = Boolean(process.env.VERCEL);
  const isProduction = process.env.NODE_ENV === "production";
  const canFallbackToLocal =
    !isProduction && !isServerless && process.env.MONGO_FALLBACK_LOCAL === "true";

  mongoose.connection.on("connected", () => console.log("MongoDB database connected successfully"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err.message));

  // Mongoose connection options
  const baseOptions = {
    dbName: "job-portal",
    // Allow query buffering while initial connection is pending.
    bufferCommands: true,
  };

  if (!uri && (isProduction || isServerless)) {
    throw new Error("MONGODB_URI is required in production/serverless environments");
  }

  // Try Atlas first if URI is provided
  if (uri) {
    try {
      console.log("Attempting to connect to MongoDB Atlas...");
      await mongoose.connect(uri, {
        ...baseOptions,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
      });
      console.log("Connected to MongoDB Atlas successfully");
      Sentry.setTag("db_target", "atlas");
      return;
    } catch (err) {
      console.error("MongoDB Atlas connection failed:", err.message);
      Sentry.captureException(err);

      if (canFallbackToLocal) {
        console.warn("Falling back to local MongoDB for development");
        Sentry.setTag("db_target", "local");
      } else {
        throw err;
      }
    }
  }

  // Try local MongoDB
  if (!canFallbackToLocal) {
    throw new Error("Local MongoDB fallback is disabled for this environment");
  }

  try {
    console.log("Attempting to connect to local MongoDB...");
    await mongoose.connect(localUri, {
      ...baseOptions,
      directConnection: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    console.log("Connected to local MongoDB successfully");
    Sentry.setTag("db_target", "local");
  } catch (localErr) {
    console.error("Local MongoDB connection failed:", localErr.message);
    console.warn("⚠️  WARNING: Running without database connection. Database operations will fail.");
    console.warn("Please ensure MongoDB is running on", localUri);
    Sentry.captureException(localErr);
    Sentry.setTag("db_target", "failed");
    // Don't throw - allow the server to start for development
  }
};

export default connectDB;
