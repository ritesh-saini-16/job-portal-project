import express from 'express';
import { getUserData, applyForJob, getUserJobApplications, updateUserResume, registerUser, loginUser } from '../controllers/userController.js';
import { protectUser } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// register user
router.post('/register', upload.single('image'), registerUser);

// login user
router.post('/login', loginUser);

// get user data (also aliased as /me for client compatibility)
router.get('/user', protectUser, getUserData);
router.get('/me', protectUser, getUserData);

// apply for a job — resume must already be saved on profile (upload via /update-resume on Applied Jobs)
router.post('/apply', protectUser, applyForJob);

// get user applied applications
router.get('/applications', protectUser, getUserJobApplications);

// update user resume
router.post('/update-resume', protectUser, upload.single('resume'), updateUserResume);

export default router;
