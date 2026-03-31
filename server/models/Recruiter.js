import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    image: { type: String, default: "" },
}, { timestamps: true });

const Recruiter = mongoose.model("Recruiter", RecruiterSchema);

export default Recruiter;
