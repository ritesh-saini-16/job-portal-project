import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    level: { type: String, required: true },
    salary: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    visible: { type: Boolean, default: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
    companyModel: { type: String, enum: ['Company', 'Recruiter'], default: 'Company' }
});


const Job = mongoose.model("Job", JobSchema);   

export default Job;