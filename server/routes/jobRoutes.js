import express from 'express';  

import {getJobs, getJobById}  from '../controllers/jobController.js';

const router = express.Router();        

// routes to get all jobs data 

router.get('/' , getJobs);

// routes to get a single job by ID
router.get('/:id' , getJobById);

export default router;