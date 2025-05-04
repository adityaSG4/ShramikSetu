const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// This function handles user registration by validating the input, checking for existing users, hashing the password, and creating a new user in the database.
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.createUser(username, email, hashedPassword, 'user');
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register user' });
        console.error(err);
    }
};

// This function handles user login by validating the input, checking for existing users, comparing the password, and generating a JWT token.
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: {
                username: user.username,
                email: user.email,
            },
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
};
