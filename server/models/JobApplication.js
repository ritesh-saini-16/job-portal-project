import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: mongoose.Schema.Types.Mixed, ref: "User", required: true },
    companyId: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);

export default JobApplication;
