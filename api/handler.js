import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express from 'express';
import cors from 'cors';
import connectDB from '../config/db.js';
import userRoutes from '../routes/userRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import { clerkWebhooks } from '../controllers/webhooks.js';
import companyroutes from '../routes/companyRoutes.js';
import connectCloudinary from '../config/cloudinary.js';
import jobRoutes from '../routes/jobRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Track if this is the first init
let isInitialized = false;
let initPromise = null;

// Initialize once
async function initializeApp() {
    if (isInitialized) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Connect to database
            await connectDB().catch(err => {
                console.error("⚠️ DB Connection Warning on startup:", err.message);
                console.warn("Server will run but database operations may fail");
            });

            // Connect to Cloudinary
            await connectCloudinary().catch(err => {
                console.error("⚠️ Cloudinary Connection Warning:", err.message);
            });

            isInitialized = true;
        } catch (error) {
            console.error("Error initializing app:", error);
            throw error;
        }
    })();

    return initPromise;
}

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : null
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize on first request (BEFORE routes)
app.use(async (req, res, next) => {
    try {
        await initializeApp();
        next();
    } catch (error) {
        console.error('Initialization error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/companies', companyroutes);
app.use('/api/jobs', jobRoutes);
app.post('/webhooks', clerkWebhooks);

// Static files for production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ success: false, message: 'API Route Not Found' });
        }
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend build not found.');
        }
    });
}

export default app;
