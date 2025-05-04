// routes/profileRoutes.js
const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController'); // Adjust path if needed
const { verifyToken } = require('../middleware/authMiddleware'); // Adjust path if needed
const validateRequest = require('../middleware/validationMiddleware'); // We'll create this

const router = express.Router();

// --- Helper (can be moved to a utils file) ---
// Ensures recommendations is always a parsable array or empty array string
function sanitizeRecommendations(value) {
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return JSON.stringify(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            return '[]';
        }
    }
    return JSON.stringify(Array.isArray(value) ? value : []);
}

// --- Validation Rules ---
const profileValidationRules = [
    body('fullName')
        .notEmpty().withMessage('Full name is required.')
        .trim().escape(),
    body('dob')
        .optional({ nullable: true, checkFalsy: true }) // Allow empty/null
        .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD).')
        .toDate(), // Convert to Date object if valid
    body('gender')
        .optional({ checkFalsy: true })
        .isIn(['Male', 'Female', 'Other', '']).withMessage('Invalid gender selected.'),
    body('mobileNumber')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number format.'), // Basic check
    body('city')
        .optional({ checkFalsy: true })
        .trim().escape(),
    body('highestQualification')
        .optional({ checkFalsy: true })
        .trim().escape(),
    body('occupation')
        .optional({ checkFalsy: true })
        .trim().escape(),
    body('workExperience')
        .optional({ checkFalsy: true })
        .trim().escape(),
    body('interests')
        .optional({ checkFalsy: true })
        .trim().escape(),
    body('profilePicture')
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage('Profile picture must be a valid URL.'),
    // Sanitize recommendations: ensure it's a stringified JSON array
    body('recommendations')
        .customSanitizer(sanitizeRecommendations)
];


// --- Routes for the Logged-In User's Profile ---

// GET /api/profile - Get the current logged-in user's profile
router.get(
    '/',
    verifyToken, // Ensure user is logged in
    profileController.getMyProfile
);

// POST /api/profile - Create a profile for the current logged-in user
router.post(
    '/',
    verifyToken,
    profileValidationRules, // Apply validation rules
    validateRequest,        // Middleware to handle validation errors
    profileController.createMyProfile
);

// PUT /api/profile - Update the current logged-in user's profile
router.put(
    '/',
    verifyToken,
    profileValidationRules, // Apply validation rules
    validateRequest,        // Middleware to handle validation errors
    profileController.updateMyProfile
);

// Optional: DELETE /api/profile - Delete the current logged-in user's profile
// router.delete('/', verifyToken, profileController.deleteMyProfile);

module.exports = router;