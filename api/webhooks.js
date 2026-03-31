import dotenv from "dotenv";
import connectDB from "../server/config/db.js";
import { Webhooks } from "svix";
import User from "../server/models/User.js";

dotenv.config({ path: "../.env" });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  try {
    await connectDB();
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const payload = Buffer.concat(chunks).toString("utf8");

    const wh = new Webhooks({ secret: process.env.CLERK_WEBHOOK_SECRET });
    await wh.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const body = JSON.parse(payload || "{}");
    const { data, type } = body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url || "",
          resume: "",
        };
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true, setDefaultsOnInsert: true });
        res.json({});
        return;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url || "",
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        return;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        return;
      }
      default: {
        res.json({});
        return;
      }
    }
  } catch (err) {
    res.status(400).json({ success: false, message: "Webhook verification or processing failed" });
  }
}
