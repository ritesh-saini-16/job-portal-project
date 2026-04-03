import mongoose from "mongoose";
import Sentry from "./instrument.js";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017";

  mongoose.connection.on("connected", () => console.log("MongoDB database connected successfully"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err.message));

  // Mongoose connection options
  const baseOptions = {
    dbName: "job-portal",
    // Allow query buffering while initial connection is pending.
    bufferCommands: true,
  };

  // Try Atlas first if URI is provided
  if (uri) {
    try {
      console.log("Attempting to connect to MongoDB Atlas...");
      await mongoose.connect(uri, {
        ...baseOptions,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 15000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 5,
      });
      console.log("Connected to MongoDB Atlas successfully");
      return;
    } catch (err) {
      console.error("MongoDB Atlas connection failed:", err.message);
      Sentry.captureException(err);

      const msg = String(err?.message || "");
      const isAtlasNetworkIssue =
        msg.includes("SSL routines") ||
        msg.includes("tlsv1 alert internal error") ||
        msg.includes("ReplicaSetNoPrimary") ||
        msg.includes("Could not connect to any servers") ||
        msg.includes("buffering timed out");

      // Only fallback to local if it's a network issue and fallback is enabled
      if (isAtlasNetworkIssue && process.env.MONGO_FALLBACK_LOCAL === "true") {
        console.warn("Falling back to local MongoDB for development");
        Sentry.setTag("db_target", "local");
      } else {
        throw err; // Re-throw if not a network issue or fallback disabled
      }
    }
  }

  // Try local MongoDB
  try {
    console.log("Attempting to connect to local MongoDB...");
    await mongoose.connect(localUri, {
      ...baseOptions,
      directConnection: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
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
