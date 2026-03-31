import './config/instrument.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import User from './models/User.js';
import Sentry from './config/instrument.js';
import userRoutes from './routes/userRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';

dotenv.config({ path: '../.env' });


// initialize express

const app = express();

// connect to the database
connectDB().catch(err => console.error("DB Connection Error on startup:", err.message));



// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));


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

// PORT

const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
