import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
import Recruiter from "../models/Recruiter.js";

const jwtSecret = () => process.env.JWT_SECRET || "secret-key";

export const protectCompany = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, login again.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret());

    let company = await Company.findById(decoded.id).select('-password');
    if (!company) {
      const recruiter = await Recruiter.findById(decoded.id).select('-password');
      if (!recruiter) {
        return res.status(401).json({ success: false, message: 'Not authorized, login again.' });
      }
      company = recruiter;
      req.companyModel = 'Recruiter';
    } else {
      req.companyModel = 'Company';
    }

    req.company = company;
    next();
  } catch (error) {
    console.error('protectCompany auth error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, login again.' });
  }
};

export const protectUser = async (req, res, next) => {
    const token = req.headers.token
    if (!token) {
        return res.status(401).json({ success: false, message: 'not authorized , login again ' })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret())
        req.userId = decoded.id
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: 'not authorized , login again ' })
    }
}