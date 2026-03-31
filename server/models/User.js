import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    resume: { type: String },
    image: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User
