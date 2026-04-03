import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { cloudinary } from "../config/cloudinary.js";
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
// register a new company

export const registerCompany = async (req, res) => {
  const { name, email, password } = req.body;
  const imageFile = req.file;

  if (!name || !email || !password || !imageFile) {
    return res
      .status(400)
      .json({
        success: false,
        message: "All fields (name,email,password,image) are required.",
      });
  }

  try {
    if (
      !process.env.CLOUDINARY_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_SECRET_KEY
    ) {
      console.error(
        "Cloudinary credentials missing, set CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY in .env",
      );
      return res
        .status(500)
        .json({
          success: false,
          message: "Cloudinary credentials are not configured.",
        });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res
        .status(409)
        .json({ success: false, message: "Company already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!imageFile || !imageFile.path) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            'Image file is required and must be uploaded as form-data field "image".',
        });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },

      token: generateToken(company._id),
    });
  } catch (error) {
    console.error("registerCompany error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// company login

export const loginCompany = async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    console.error("loginCompany error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message,
      });
  }

};

// get company data

export const getCompanyData = async (req, res) => {
  try {
    const company = req.company;
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }
    res.json({ success: true, company });
  } catch (error) {
    console.error("getCompanyData error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// post a new job

export const postJob = async (req, res) => {
  // Robust key extraction - trims spaces from incoming keys
  const trimmedBody = Object.keys(req.body).reduce((acc, key) => {
    acc[key.trim()] = req.body[key];
    return acc;
  }, {});

  const { title, description, location, salary, category, level } = trimmedBody;
  const companyId = req.company._id;
  const companyModel = req.companyModel || 'Company';

  try {
    const newJob = await Job.create({
      title,
      description,
      location,
      salary,
      category,
      level,
      companyId,
      companyModel,
      date: Date.now(),
    });
    res.json({ success: true, job: newJob });
  } catch (error) {
    console.error("postJob error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get company job applicants
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;
    const cid = String(companyId);

    const applications = await JobApplication.find({ 
      companyId: { $in: [cid, companyId] } 
    })
      .populate("userId", "name email image resume")
      .populate("jobId", "title location category level salary")
      .sort({ date: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error("getCompanyJobApplicants error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET Company posted jobs

export const getCompanyPostedJobs = async (req, res) => {
  try {
    const companyId = req.company._id;
    const cid = String(companyId);

    const jobs = await Job.find({ 
      companyId: { $in: [cid, companyId] } 
    });



// Add applicant count for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await JobApplication.countDocuments({ 
          jobId: job._id 
        });
        return { ...job.toObject(), applicants: count };
      })
    );

    res.json({ success: true, jobs: jobsWithCounts });
  } catch (error) {
    console.error("getCompanyPostedJobs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// change jjob applications status

export const changeJobApplicationStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await JobApplication.findByIdAndUpdate(id, { status });
    res.json({ success: true, message: "Application status changed." });
  } catch (error) {
    console.error("changeJobApplicationStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// change job visiblility

export const changeJobVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.company._id;  
    const cid = String(companyId);

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (cid !== String(job.companyId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to change visibility of this job." });
    } 

    job.visible = !job.visible;
    await job.save();

    res.json({ success: true, message: "Job visibility changed." });
  } catch (error) {
    console.error("changeJobVisibility error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET company stats
export const getCompanyStats = async (req, res) => {
  try {
    const companyId = req.company._id;
    const cid = String(companyId);

    const query = { 
      companyId: { $in: [cid, companyId] } 
    };

    const totalJobs = await Job.countDocuments({ 
      companyId: { $in: [cid, companyId] } 
    });
    
    const totalApplications = await JobApplication.countDocuments(query);
    const pendingApplications = await JobApplication.countDocuments({ ...query, status: 'Pending' });
    const acceptedApplications = await JobApplication.countDocuments({ ...query, status: 'Accepted' });
    const rejectedApplications = await JobApplication.countDocuments({ ...query, status: 'Rejected' });

    res.json({
      success: true,
      stats: {
        totalJobs,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications
      }
    });
  } catch (error) {
    console.error("getCompanyStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
