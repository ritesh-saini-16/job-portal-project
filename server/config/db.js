import mongoose from "mongoose";
import Sentry from "./instrument.js";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017";

  mongoose.connection.on("connected", () => console.log("MongoDB database connected successfully"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err.message));

  // Try Atlas first if URI is provided
  if (uri) {
    try {
      console.log("Attempting to connect to MongoDB Atlas...");
      await mongoose.connect(uri, {
        dbName: "job-portal",
        serverSelectionTimeoutMS: 10000,
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
        msg.includes("Could not connect to any servers");

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
      dbName: "job-portal",
      directConnection: true,
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected to local MongoDB successfully");
    Sentry.setTag("db_target", "local");
  } catch (localErr) {
    console.error("Local MongoDB connection failed:", localErr.message);
    Sentry.captureException(localErr);
    Sentry.setTag("db_target", "failed");
    throw new Error("Failed to connect to both Atlas and local MongoDB");
  }
};

export default connectDB;
