const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
//const { verifyToken } = require('../middleware/authMiddleware');


// This route is for getting the list of jobs
router.post('/job/', jobController.getJobList);

// This route is for getting the details of a specific job
router.get('/job/:Id/', jobController.getJobDetails);

module.exports = router;
