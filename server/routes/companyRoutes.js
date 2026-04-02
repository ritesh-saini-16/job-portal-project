import express from 'express';
import multer from 'multer';

import{registerCompany, loginCompany, getCompanyData, postJob, getCompanyJobApplicants, changeJobApplicationStatus, changeJobVisibility, getCompanyPostedJobs, getCompanyStats} from '../controllers/companyController.js';   
import { protectCompany } from '../middleware/authMiddleware.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// register a company
router.post('/register', upload.single('image'), registerCompany);
// company login
router.post('/login' , loginCompany);

// get company data
router.get('/company-data', protectCompany , getCompanyData);

// get company stats
router.get('/stats', protectCompany, getCompanyStats);

// post job 
router.post('/post-job' , protectCompany, postJob);

// get company posted jobs
router.get('/list-jobs' ,protectCompany, getCompanyPostedJobs);

// get company job applicants
router.get('/job-applicants' ,protectCompany, getCompanyJobApplicants );

// change applicatons staus 
router.post('/change-status' , protectCompany, changeJobApplicationStatus);

// change job visiblility 
router.post('/change-visibility' , protectCompany,   changeJobVisibility);


export default router;