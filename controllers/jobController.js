import Job  from '../models/Job.js';    
import Company from '../models/Company.js';
import Recruiter from '../models/Recruiter.js';

// get all jobs 
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true }).lean();
        // Populate companyId for each job dynamically
        const populated = await Promise.all(jobs.map(async (job) => {
            const model = job.companyModel === 'Recruiter' ? Recruiter : Company;
            const company = await model.findById(job.companyId).select('-password').lean();
            return { ...job, companyId: company || job.companyId };
        }));
        res.json({ success: true, jobs: populated });
    } catch (error) {
        console.error("getJobs error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// get single job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id).lean();
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        if (!job.visible) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        const model = job.companyModel === 'Recruiter' ? Recruiter : Company;
        const company = await model.findById(job.companyId).select('-password').lean();
        const populated = { ...job, companyId: company || job.companyId };
        res.json({ success: true, job: populated });
    } catch (error) {
        console.error("getJobById error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
