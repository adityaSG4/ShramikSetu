const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// This route is for user authentication and registration
// It includes routes to register a new user and login an existing user

// Register a new user
// This route allows a new user to create an account. It requires the user to provide their name, email, and password.
router.post('/register', userController.registerUser);

// Login an existing user
// This route allows a user to log in to their account. It requires the user to provide their email and password.
router.post('/login', userController.loginUser);

module.exports = router;
