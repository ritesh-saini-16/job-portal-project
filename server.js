import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load environment variables from root directory
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import Sentry from './config/instrument.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import companyroutes from './routes/companyRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js';

// initialize express
const app = express();

// Track initialization state
let isInitialized = false;
let initPromise = null;

// Initialize app dependencies (lazy loaded)
async function initializeApp() {
    if (isInitialized) return Promise.resolve();
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log("🔄 Starting initialization...");
            
            // connect to the database
            try {
                await connectDB();
                console.log("✅ Database connected");
            } catch (err) {
                console.error("⚠️  DB Connection Warning:", err.message);
                console.warn("⚠️  Server will run but database operations may fail");
            }

            // Connect to Cloudinary
            try {
                await connectCloudinary();
                console.log("✅ Cloudinary connected");
            } catch (err) {
                console.error("⚠️  Cloudinary Connection Warning:", err.message);
                console.warn("⚠️  Server will run but file uploads may fail");
            }

            isInitialized = true;
            console.log("✅ App initialized successfully");
            return true;
        } catch (error) {
            console.error("❌ Critical error during initialization:", error);
            // Don't throw - let app continue anyway
            isInitialized = true;
            return false;
        }
    })();

    return initPromise;
}

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
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
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

// Initialize app on first request (gracefully handles failures)
app.use(async (req, res, next) => {
    // Skip initialization for health checks
    if (req.path === '/api/health') {
        return next();
    }
    
    try {
        await initializeApp();
        next();
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Still pass to next - don't crash
        next();
    }
});

// routes
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
});

app.get('/debug-sentry', function mainHandler(req, res){
    throw new Error('Debug Sentry Error');
})


// auth endpoints
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/companies', companyroutes);
app.use('/api/jobs', jobRoutes);

// static files for production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) return res.status(404).json({ success: false, message: 'API Route Not Found' });
        
        const indexPath = path.resolve(distPath, 'index.html');
        // Check if file exists to provide better error feedback
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Frontend build not found. Please run build script.');
        }
    });
}

// PORT
const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// start server only if NOT on Vercel (Vercel handles its own listener)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
