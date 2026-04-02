import fs from "fs/promises";
import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Company from "../models/Company.js";
import Recruiter from "../models/Recruiter.js";
import { cloudinary } from "../config/cloudinary.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const jwtSecret = () => process.env.JWT_SECRET || "secret-key";

// register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let imageUrl = "";
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            imageUrl = imageUpload.secure_url;
        }

        const user = await User.create({
            _id: String(new mongoose.Types.ObjectId()),
            name,
            email,
            password: hashedPassword,
            image: imageUrl
        });

        const token = jwt.sign({ id: user._id }, jwtSecret(), { expiresIn: '7d' });

        res.json({
            success: true,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                image: user.image,
                resume: user.resume || ""
            },
            token
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// user login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret(), { expiresIn: '7d' });

        res.json({
            success: true,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                image: user.image,
                resume: user.resume || ""
            },
            token
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get user data 
export const getUserData = async (req, res) => { 
    try {
        const userId = req.userId || req.auth?.userId;
        if (!userId) {
            return res.json({ success: false, message: "not authorized, login again" });
        }
        
        let u = await User.findById(userId).select("-password").lean();
        if (!u && mongoose.Types.ObjectId.isValid(userId)) {
            u = await User.findById(new mongoose.Types.ObjectId(userId)).select("-password").lean();
        }

        if (!u) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            user: {
                id: String(u._id),
                name: u.name,
                email: u.email,
                image: u.image || "",
                resume: u.resume || "",
            },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// apply for a job — resume must already be on profile (Applied Jobs → upload resume)
export const applyForJob = async (req, res) => {  
    try {
        const { jobId } = req.body;
        const userId = req.userId || req.auth?.userId;
        if (!userId) {
            return res.json({ success: false, message: 'not authorized, login again' });
        }

        if (!jobId) {
            return res.json({ success: false, message: "Job ID is required" });
        }

        const uid = String(userId);
        const isAlreadyApplied = await JobApplication.find({
            jobId,
            userId: { $in: [uid, userId] }
        });
        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: "Already Applied" });
        }

        const jobData = await Job.findById(jobId);
        if (!jobData) {
            return res.json({ success: false, message: "Job not found" });
        }

        let userDoc = await User.findById(userId);
        if (!userDoc && mongoose.Types.ObjectId.isValid(userId)) {
            userDoc = await User.findById(new mongoose.Types.ObjectId(userId));
        }

        if (!userDoc) {
            return res.json({ success: false, message: "User not found." });
        }

        if (!userDoc.resume) {
            return res.json({
                success: false,
                message: "Resume is required. Go to Applied Jobs, upload your resume there, then apply again.",
            });
        }

        await JobApplication.create({
            jobId,
            userId: userDoc._id, // Store the exact _id from user document
            companyId: jobData.companyId,
            date: Date.now()
        });

        res.json({ success: true, message: "Applied Successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// GET USER APPLIED APPLICATION
export const getUserJobApplications = async (req, res) => {
    try {
        const userId = req.userId || req.auth?.userId;
        if (!userId) {
            return res.json({ success: false, message: 'not authorized, login again' });
        }

        const uid = String(userId);
        const applications = await JobApplication.find({
            userId: { $in: [uid, userId] }
        })
            .populate("jobId", "title description location category level salary companyModel")
            .sort({ date: -1 })
            .lean();

        const enriched = await Promise.all(
            applications.map(async (app) => {
                const job = app.jobId && typeof app.jobId === "object" ? app.jobId : null;
                let companyDoc = null;
                
                if (job) {
                    const cid = String(app.companyId);
                    if (job.companyModel === "Recruiter") {
                        companyDoc = await Recruiter.findById(app.companyId).select("name email image").lean();
                        if (!companyDoc && mongoose.Types.ObjectId.isValid(cid)) {
                            companyDoc = await Recruiter.findById(new mongoose.Types.ObjectId(cid)).select("name email image").lean();
                        }
                    } else {
                        companyDoc = await Company.findById(app.companyId).select("name email image").lean();
                        if (!companyDoc && mongoose.Types.ObjectId.isValid(cid)) {
                            companyDoc = await Company.findById(new mongoose.Types.ObjectId(cid)).select("name email image").lean();
                        }
                    }
                }
                
                if (!companyDoc && app.companyId) {
                    const cid = String(app.companyId);
                    companyDoc = (await Recruiter.findById(app.companyId).select("name email image").lean()) ||
                                 (await Company.findById(app.companyId).select("name email image").lean());
                    
                    if (!companyDoc && mongoose.Types.ObjectId.isValid(cid)) {
                        const ocid = new mongoose.Types.ObjectId(cid);
                        companyDoc = (await Recruiter.findById(ocid).select("name email image").lean()) ||
                                     (await Company.findById(ocid).select("name email image").lean());
                    }
                }

                return {
                    ...app,
                    companyId: companyDoc || { _id: app.companyId, name: "Unknown", image: "" },
                };
            })
        );

        return res.json({ success: true, applications: enriched });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// update user profile (resume) — PDF stored on Cloudinary, URL saved on user
export const updateUserResume = async (req, res) => {  
    try {
        const userId = req.userId || req.auth?.userId;
        if (!userId) {
            return res.json({ success: false, message: 'not authorized, login again' });
        }
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.json({ success: false, message: "Please upload a PDF resume file." });
        }

        let resumeUpload;
        try {
            resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
                resource_type: "raw",
            });
        } catch {
            resumeUpload = await cloudinary.uploader.upload(resumeFile.path);
        }
        try {
            await fs.unlink(resumeFile.path);
        } catch {
            /* ignore missing temp file */
        }

        let userToUpdate = await User.findById(userId);
        if (!userToUpdate && mongoose.Types.ObjectId.isValid(userId)) {
            userToUpdate = await User.findById(new mongoose.Types.ObjectId(userId));
        }

        if (!userToUpdate) {
            return res.json({ success: false, message: "User not found." });
        }

        userToUpdate.resume = resumeUpload.secure_url;
        await userToUpdate.save();

        res.json({
            success: true,
            message: "Resume saved to your profile.",
            user: {
                id: String(userToUpdate._id),
                name: userToUpdate.name,
                email: userToUpdate.email,
                image: userToUpdate.image || "",
                resume: userToUpdate.resume || "",
            },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

