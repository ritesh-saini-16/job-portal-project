import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Recruiter from '../models/Recruiter.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Company name, email, and password are required.' });
    }

    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(409).json({ message: 'Recruiter email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({
      name,
      email,
      password: hashedPassword,
      image: image || '',
    });

    const token = jwt.sign({ id: recruiter._id, email: recruiter.email, role: 'recruiter' }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });

    res.json({ user: { id: recruiter._id, name: recruiter.name, email: recruiter.email, image: recruiter.image, role: 'recruiter' }, token });
  } catch (error) {
    console.error('Registration failure:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const recruiter = await Recruiter.findOne({ email }).select('+password');
    if (!recruiter) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: recruiter._id, email: recruiter.email, role: 'recruiter' }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });

    res.json({ user: { id: recruiter._id, name: recruiter.name, email: recruiter.email, image: recruiter.image, role: 'recruiter' }, token });
  } catch (error) {
    console.error('Login failure:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router;
