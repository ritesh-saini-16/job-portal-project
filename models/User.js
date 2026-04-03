import mongoose from "mongoose";

// Support both Clerk-based (string _id) and manual (ObjectId) users
const UserSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    resume: { type: String },
    image: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User
