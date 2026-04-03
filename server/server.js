import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

import Sentry from './config/instrument.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import companyRoutes from './routes/companyRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js';

// initialize express
const app = express();

// debug environment
console.log("🚀 Starting server in " + (process.env.NODE_ENV || 'development') + " mode");
console.log("📂 Current directory: " + process.cwd());
console.log("🔑 Checking environment variables:");
['MONGODB_URI', 'CLOUDINARY_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY', 'JWT_SECRET', 'CLERK_WEBHOOK_SECRET'].forEach(env => {
    console.log(`   - ${env}: ${process.env[env] ? '✅ Loaded' : '❌ Missing'}`);
});

// connect to the database and services (non-blocking for startup)
connectDB().catch(err => console.error("⚠️ DB Connection Error:", err.message));
connectCloudinary().catch(err => console.error("⚠️ Cloudinary Error:", err.message));

// middleware - CORS must be before routes
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
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'token', 'Authorization']
}));

app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy', env: process.env.NODE_ENV });
});

app.get('/debug-sentry', function mainHandler(req, res){
    throw new Error('Debug Sentry Error');
})

// auth endpoints
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);

// static files for production
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
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
} else {
    // Fallback for Vercel if dist is in a different location or not found
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ success: false, message: 'API Route Not Found' });
        }
        res.status(404).send('Static folder not found at ' + distPath);
    });
}

// PORT
const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(err.status || 500).json({ 
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// start server only if NOT on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
