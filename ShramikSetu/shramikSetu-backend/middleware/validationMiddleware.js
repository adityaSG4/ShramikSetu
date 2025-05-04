// middleware/validationMiddleware.js
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Log the validation errors for debugging
        console.error("Validation Errors:", JSON.stringify(errors.array()));
        // Return a 400 Bad Request with the errors
        return res.status(400).json({
            message: "Validation failed. Please check your input.",
            errors: errors.array() // Provides details on which fields failed
        });
    }
    // No validation errors, proceed to the next middleware/controller
    next();
};

module.exports = validateRequest;