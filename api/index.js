import dotenv from "dotenv";
import connectDB from "../server/config/db.js";

dotenv.config({ path: "../.env" });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  try {
    await connectDB();
    res.status(200).send("API working");
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection error" });
  }
}
