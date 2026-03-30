import './config/instrument.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import connectDB from './config/db.js';

import Sentry from './config/instrument.js';
import {clerkWebhooks} from './controllers/webhooks.js'

dotenv.config({ path: '../.env' });


// initialize express

const app = express();

// connect to the database
await connectDB();



// middleware
app.use(cors());
app.use(express.json());


// routes
app.get('/', (req, res) => {
    res.send('API working ');
})

app.get("/debug-sentry" , function mainHandler(req , res){
    throw new Error("Debug Sentry Error")
})

app.post("/webhooks" , clerkWebhooks)

// PORT

const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
