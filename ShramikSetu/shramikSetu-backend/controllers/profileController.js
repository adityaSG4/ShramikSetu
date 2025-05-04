// controllers/profileController.js
const pool = require('../config/db'); // Adjust path if needed

// --- Get Logged-In User's Profile ---
exports.getMyProfile = async (req, res) => {
    try {
        // User ID comes from the verifyToken middleware
        if (!req.user || !req.user.id) {
            // This check might be redundant if verifyToken guarantees req.user.id
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        }
        const userId = req.user.id;
        console.log(`getMyProfile: Fetching profile for user ID: ${userId}`);

        const query = 'SELECT * FROM profile WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);

        if (rows.length === 0) {
            console.log(`getMyProfile: Profile not found for user ID: ${userId}`);
            // Return 404 Not Found - Frontend can use this to know profile doesn't exist
            return res.status(404).json({ message: 'Profile not found for this user.' });
        }

        const userProfile = rows[0];

        // Ensure recommendations is an array (pg driver might parse JSONB automatically)
        if (typeof userProfile.recommendations === 'string') {
            try {
                userProfile.recommendations = JSON.parse(userProfile.recommendations);
            } catch (e) {
                console.warn(`getMyProfile: Could not parse recommendations JSON for user ${userId}. Setting to empty array.`, userProfile.recommendations);
                userProfile.recommendations = [];
            }
        } else if (!Array.isArray(userProfile.recommendations)) {
            userProfile.recommendations = []; // Default to empty array if null or other type
        }

        console.log(`getMyProfile: Profile found for user ID: ${userId}`);
        res.status(200).json(userProfile);

    } catch (error) {
        console.error('Error in getMyProfile:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to fetch user profile due to an internal error.' });
    }
};

// --- Create Logged-In User's Profile ---
exports.createMyProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        }
        const userId = req.user.id;

        // Data is already validated and sanitized by middleware
        const {
            fullName, dob, gender, mobileNumber, city,
            highestQualification, occupation, workExperience, interests,
            profilePicture, recommendations // recommendations is already stringified JSON array
        } = req.body;

        console.log(`createMyProfile: Attempting to create profile for user ID: ${userId}`);

        // Optional: Check if profile already exists before attempting insert
        // This prevents hitting the unique constraint error unnecessarily,
        // providing a slightly cleaner 409 response.
        const checkQuery = 'SELECT 1 FROM profile WHERE user_id = $1';
        const { rowCount: existingCount } = await pool.query(checkQuery, [userId]);
        if (existingCount > 0) {
            console.warn(`createMyProfile: Profile already exists for user ID: ${userId}.`);
            return res.status(409).json({ message: 'Profile already exists for this user.' });
        }

        const insertQuery = `
            INSERT INTO profile (
                user_id, fullName, dob, gender, mobileNumber, city,
                highestQualification, occupation, workExperience, interests,
                profilePicture, recommendations
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING user_id;
        `;
        const values = [
            userId, fullName, dob || null, gender || '', mobileNumber || '', city || '',
            highestQualification || '', occupation || '', workExperience || '', interests || '',
            profilePicture || '', recommendations // Already stringified JSON
        ];

        const { rowCount } = await pool.query(insertQuery, values);

        if (rowCount === 0) {
            console.error(`createMyProfile: Failed to insert profile for user ID: ${userId}, zero rows affected.`);
            // Should not happen if checkQuery passed and no other error occurred
            return res.status(500).json({ message: 'Failed to create profile.' });
        }

        console.log(`createMyProfile: Profile created successfully for user ID: ${userId}`);
        // Return 201 Created status code
        res.status(201).json({ message: 'Profile created successfully.' });

    } catch (error) {
        console.error('Error in createMyProfile:', error.message, error.stack);
        // Handle potential unique constraint violation if the initial check is removed/fails
        if (error.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({ message: 'Profile already exists for this user (constraint violation).' });
        }
        res.status(500).json({ message: 'Failed to create profile due to an internal error.' });
    }
};

// --- Update Logged-In User's Profile ---
exports.updateMyProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        }
        const userId = req.user.id;

        // Data is validated and sanitized
        const {
            fullName, dob, gender, mobileNumber, city,
            highestQualification, occupation, workExperience, interests,
            profilePicture, recommendations // recommendations is stringified JSON
        } = req.body;

        console.log(`updateMyProfile: Attempting to update profile for user ID: ${userId}`);

        const query = `
            UPDATE profile
            SET
                fullName = $1, dob = $2, gender = $3, mobileNumber = $4, city = $5,
                highestQualification = $6, occupation = $7, workExperience = $8,
                interests = $9, profilePicture = $10, recommendations = $11
            WHERE user_id = $12;
        `;
        const values = [
            fullName, dob || null, gender || '', mobileNumber || '', city || '',
            highestQualification || '', occupation || '', workExperience || '', interests || '',
            profilePicture || '', recommendations, // Already stringified JSON
            userId
        ];

        const { rowCount } = await pool.query(query, values);

        if (rowCount === 0) {
            // This means the user ID didn't exist in the profile table
            console.warn(`updateMyProfile: Profile not found for user ID: ${userId}. Cannot update.`);
            // Return 404 Not Found
            return res.status(404).json({ message: 'Profile not found for this user. Cannot update.' });
            // Alternative: Could change this to an "Upsert" logic if PUT should create if not exists
        }

        console.log(`updateMyProfile: Profile updated successfully for user ID: ${userId}`);
        res.status(200).json({ message: 'Profile updated successfully.' });

    } catch (error) {
        console.error('Error in updateMyProfile:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to update profile due to an internal error.' });
    }
};

// Optional: --- Delete Logged-In User's Profile ---
/*
exports.deleteMyProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
        }
        const userId = req.user.id;
        console.log(`deleteMyProfile: Attempting to delete profile for user ID: ${userId}`);

        const query = 'DELETE FROM profile WHERE user_id = $1';
        const { rowCount } = await pool.query(query, [userId]);

        if (rowCount === 0) {
             console.warn(`deleteMyProfile: Profile not found for user ID: ${userId}. Cannot delete.`);
            return res.status(404).json({ message: 'Profile not found.' });
        }

        console.log(`deleteMyProfile: Profile deleted successfully for user ID: ${userId}`);
        // Return 204 No Content or 200 OK with message
        res.status(200).json({ message: 'Profile deleted successfully.' });

    } catch (error) {
         console.error('Error in deleteMyProfile:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to delete profile due to an internal error.' });
    }
};
*/

// --- REMOVED FUNCTIONS ---
// exports.checkProfileExists = ... (No longer needed)
// exports.getRecommendations = ... (No longer needed)












// const axios = require('axios');
// const pool = require('../config/db');



// CREATE TABLE profile (
//     user_id SERIAL PRIMARY KEY,
//     fullName TEXT NOT NULL,
//     dob TEXT, 
//     gender TEXT,
//     mobileNumber TEXT,
//     city TEXT,
//     highestQualification TEXT,
//     occupation TEXT,
//     workExperience TEXT,
//     interests TEXT,
//     profilePicture TEXT,
//     recommendations JSONB
// );

// // This route is for getting the profile of a user by their ID
// router.get('/profile/:userId', verifyToken, profileController.checkProfileExists);

// // This route is for creating a new profile
// router.post('/profile/', verifyToken, profileController.createProfile);

// // This route is for getting the profile of a user
// router.get('/profile/', verifyToken, profileController.getProfileDetails);

// // This route is for updating the profile of a user
// router.put('/profile/', verifyToken, profileController.updateProfileDetails);

// // This route is for getting the recommendations of a user
// router.get('/profile/recommendations', verifyToken, profileController.getRecommendations);


// // profileController.js
// const pool = require('../config/db'); // Assuming this is configured for PostgreSQL

// // --- Helper to ensure recommendations is always a stringifiable array ---
// function ensureArray(data) {
//     if (typeof data === 'string') {
//         try {
//             const parsed = JSON.parse(data);
//             return Array.isArray(parsed) ? parsed : [];
//         } catch (e) {
//             return []; // Return empty array if parsing fails
//         }
//     }
//     return Array.isArray(data) ? data : [];
// }


// // --- Check Profile Existence (uses req.user.id from token) ---
// // Note: The route /profile/:userId is defined but this function uses token ID.
// // If you need to check by URL param, you'd use req.params.userId.
// // Keeping it as is based on your code, assuming it's intended to check the logged-in user's profile.
// exports.checkProfileExists = async (req, res) => {
//     try {
//         // Ensure req.user and req.user.id exist (from verifyToken middleware)
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
//         }
//         const userId = req.user.id;
//         console.log('Checking profile existence for user:', userId);

//         const query = 'SELECT 1 FROM profile WHERE user_id = $1';
//         const { rows } = await pool.query(query, [userId]); // Use { rows } for pg

//         if (rows.length > 0) {
//             console.log('Profile exists for user:', userId);
//             return res.status(200).json({ exists: true });
//         } else {
//             console.log('Profile does not exist for user:', userId);
//             // Use 404 Not Found when checking for a specific resource
//             return res.status(404).json({ exists: false, message: 'Profile not found for this user.' });
//         }
//     } catch (error) {
//         console.error('Error checking profile existence:', error.message);
//         res.status(500).json({ error: 'Failed to check profile status' });
//     }
// };

// // --- Create Profile (POST /profile/) ---
// exports.createProfile = async (req, res) => {
//     try {
//         // Ensure req.user and req.user.id exist
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
//         }
//         const userId = req.user.id;

//         const {
//             fullName = '',
//             dob = null, // Use null for optional date
//             gender = '',
//             mobileNumber = '',
//             city = '',
//             highestQualification = '',
//             occupation = '',
//             workExperience = '',
//             interests = '',
//             profilePicture = '', // Default empty string might be better than 'x'
//             recommendations = '[]' // Expect stringified JSON from frontend
//         } = req.body;

//         // Ensure recommendations is a valid JSON array string
//         const recommendationsArray = ensureArray(recommendations);
//         const recommendationsJsonString = JSON.stringify(recommendationsArray);

//         // Check if the user already has a profile (using correct syntax)
//         const checkQuery = 'SELECT user_id FROM profile WHERE user_id = $1';
//         const { rows: checkRows } = await pool.query(checkQuery, [userId]); // Use { rows }

//         if (checkRows.length > 0) {
//             // 409 Conflict is more appropriate if trying to create an existing resource
//             return res.status(409).json({ message: 'Profile already exists for this user.' });
//         }

//         // Create a new profile (using correct syntax)
//         const insertQuery = `
//             INSERT INTO profile (
//                 user_id, fullName, dob, gender, mobileNumber, city,
//                 highestQualification, occupation, workExperience, interests,
//                 profilePicture, recommendations
//             )
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
//             RETURNING user_id; -- Optionally return something to confirm insertion
//         `;
//         const values = [
//             userId,
//             fullName,
//             dob || null, // Store null if dob is empty string or not provided
//             gender,
//             mobileNumber,
//             city,
//             highestQualification,
//             occupation,
//             workExperience,
//             interests,
//             profilePicture,
//             recommendationsJsonString // Store the validated JSON string
//         ];

//         const { rowCount } = await pool.query(insertQuery, values); // Use { rowCount } for pg INSERT/UPDATE/DELETE

//         if (rowCount === 0) {
//             // This usually indicates an issue if no error was thrown
//             return res.status(500).json({ message: 'Failed to create profile, zero rows affected.' });
//         }

//         res.status(201).json({ message: 'Profile created successfully' });

//     } catch (error) {
//         console.error('Error creating user profile:', error.message, error.stack);
//         // Check for unique constraint violation if applicable (depends on DB schema)
//         if (error.code === '23505') { // PostgreSQL unique violation error code
//              return res.status(409).json({ error: 'Profile already exists (unique constraint).' });
//         }
//         res.status(500).json({ error: 'Failed to create user profile' });
//     }
// };


// // --- Get Profile Details (GET /profile/) ---
// exports.getProfileDetails = async (req, res) => {
//     try {
//         // Ensure req.user and req.user.id exist
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
//         }
//         const userId = req.user.id;

//         const query = 'SELECT * FROM profile WHERE user_id = $1';
//         const { rows } = await pool.query(query, [userId]); // Use { rows }

//         if (rows.length === 0) {
//             // 404 Not Found is correct here
//             return res.status(404).json({ message: 'Profile not found for this user.' });
//         }

//         const userProfile = rows[0];

//         // Important: Ensure recommendations is returned as an array, not a string
//         // The frontend expects an array. The DB stores JSON(B), which pool might parse automatically
//         // or might return as a string depending on config/driver version. Explicitly parse if needed.
//         if (typeof userProfile.recommendations === 'string') {
//              try {
//                  userProfile.recommendations = JSON.parse(userProfile.recommendations);
//              } catch (e) {
//                  console.warn(`Failed to parse recommendations JSON for user ${userId}: ${userProfile.recommendations}`);
//                  userProfile.recommendations = []; // Default to empty array on parse error
//              }
//         } else if (!Array.isArray(userProfile.recommendations)) {
//             // Handle cases where it might be null or some other non-array type
//             userProfile.recommendations = [];
//         }


//         res.status(200).json(userProfile);
//     } catch (error) {
//         console.error('Error fetching user profile:', error.message, error.stack);
//         res.status(500).json({ error: 'Failed to fetch user profile' });
//     }
// };


// // --- Update Profile Details (PUT /profile/) ---
// exports.updateProfileDetails = async (req, res) => {
//     try {
//         // Ensure req.user and req.user.id exist
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
//         }
//         const userId = req.user.id;

//         const {
//             fullName,
//             dob,
//             gender,
//             mobileNumber,
//             city,
//             highestQualification,
//             occupation,
//             workExperience,
//             interests,
//             profilePicture,
//             recommendations // Expect stringified JSON from frontend
//         } = req.body;

//          // Ensure recommendations is a valid JSON array string
//         const recommendationsArray = ensureArray(recommendations);
//         const recommendationsJsonString = JSON.stringify(recommendationsArray);


//         // Update profile (using correct syntax and fixed comma)
//         const query = `
//             UPDATE profile
//             SET fullName = $1,
//                 dob = $2,
//                 gender = $3,
//                 mobileNumber = $4,
//                 city = $5,
//                 highestQualification = $6,
//                 occupation = $7,
//                 workExperience = $8, -- Added missing comma here
//                 interests = $9,
//                 profilePicture = $10,
//                 recommendations = $11
//             WHERE user_id = $12;
//         `;

//         const values = [
//             fullName,
//             dob || null,
//             gender,
//             mobileNumber,
//             city,
//             highestQualification,
//             occupation,
//             workExperience,
//             interests,
//             profilePicture,
//             recommendationsJsonString, // Store the validated JSON string
//             userId
//         ];

//         const { rowCount } = await pool.query(query, values); // Use { rowCount }

//         if (rowCount === 0) {
//             // If rowCount is 0, it means the WHERE clause didn't match (user_id not found)
//             return res.status(404).json({ message: 'User profile not found to update.' });
//         }

//         res.status(200).json({ message: 'Profile updated successfully' });

//     } catch (error) {
//         console.error('Error updating user profile:', error.message, error.stack);
//         res.status(500).json({ error: 'Failed to update user profile' });
//     }
// };

// // --- Get Recommendations (GET /profile/recommendations) ---
// // Note: This might be redundant if GET /profile/ already returns recommendations.
// // Keep it if you specifically need *only* recommendations.
// exports.getRecommendations = async (req, res) => {
//     try {
//         // Ensure req.user and req.user.id exist
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
//         }
//         const userId = req.user.id;

//         const query = 'SELECT recommendations FROM profile WHERE user_id = $1'; // Use $1
//         const { rows } = await pool.query(query, [userId]); // Use { rows }

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'User profile not found.' });
//         }

//         let recommendationsData = rows[0].recommendations;

//         // Ensure it's returned as an array
//         if (typeof recommendationsData === 'string') {
//             try {
//                 recommendationsData = JSON.parse(recommendationsData);
//             } catch (e) {
//                  console.warn(`Failed to parse recommendations JSON for user ${userId}: ${recommendationsData}`);
//                  recommendationsData = [];
//             }
//         } else if (!Array.isArray(recommendationsData)) {
//              recommendationsData = [];
//         }

//         res.status(200).json(recommendationsData); // Send the (potentially parsed) recommendations array

//     } catch (error) {
//         console.error('Error fetching user recommendations:', error.message, error.stack);
//         res.status(500).json({ error: 'Failed to fetch user recommendations' });
//     }
// };