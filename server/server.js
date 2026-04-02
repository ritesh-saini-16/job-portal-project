import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load environment variables from root directory
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
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

// connect to the database
await connectDB().catch(err => {
  console.error("⚠️  DB Connection Warning on startup:", err.message);
  console.warn("Server will run but database operations may fail");
});

await connectCloudinary();

// middleware - CORS must be before routes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.FRONTEND_URL,
  'https://' + process.env.VERCEL_URL
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



// routes
app.get('/', (req, res) => {
    res.send('API working');
})

app.get('/debug-sentry', function mainHandler(req, res){
    throw new Error('Debug Sentry Error');
})


// auth endpoints
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/companies', companyroutes);
app.use('/api/jobs', jobRoutes);

// static files for production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// PORT

const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
