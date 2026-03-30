import dotenv from "dotenv";
import connectDB from "../server/config/db.js";
import { clerkWebhooks } from "../server/controllers/webhooks.js";

dotenv.config({ path: "../.env" });

export default async function handler(req, res) {
  try {
    await connectDB();
    await clerkWebhooks(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
}
