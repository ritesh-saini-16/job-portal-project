import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Recruiter from '../models/Recruiter.js';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(409).json({ success: false, message: 'Recruiter email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = '';
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = imageUpload.secure_url;
    }

    const recruiter = await Recruiter.create({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    const token = jwt.sign(
      { id: recruiter._id, email: recruiter.email, role: 'recruiter' },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        image: recruiter.image,
        role: 'recruiter'
      },
      token
    });
  } catch (error) {
    console.error('Registration failure:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const recruiter = await Recruiter.findOne({ email }).select('+password');
    if (!recruiter) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: recruiter._id, email: recruiter.email, role: 'recruiter' },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        image: recruiter.image,
        role: 'recruiter'
      },
      token
    });
  } catch (error) {
    console.error('Login failure:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /me — fetch logged-in recruiter profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    const recruiter = await Recruiter.findById(decoded.id).select('-password');
    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found.' });
    }
    res.json({ success: true, company: recruiter });
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(401).json({ success: false, message: 'Not authorized.' });
  }
});

export default router;

