// src/pages/Profile/index.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import Header from '../Header'; // Or your actual Header/Navbar component path
import { api } from '../../Api/api'; // Adjust path to your api instance
import { useNavigate } from 'react-router-dom';
import './index.css'; // Import a CSS file for custom styles if needed

// Define API status constants
const apiStatus = {
  initial: 'INITIAL',
  loading: 'LOADING',
  success: 'SUCCESS',
  error: 'ERROR',
};

// List of sectors (Ensure this list is comprehensive)
const sectorList = [
"Agriculture", "Apparel, Madeups & Home Furnishing", "Automotive",
  "Banking, Financial Services & Insurance (BFSI)", "Beauty & Wellness",
  "Capital Goods", "Chemical & PetroChemical", "Construction",
  "Domestic Workers", "Education", "Electronics", "Food Processing",
  "Gem & Jewellery", "Healthcare", "Hydrocarbon", "Indian Iron & Steel",
  "Indian Plumbing", "Infrastructure Equipment", "IT-ITeS",
  "Life Sciences", "Logistics",
  "Management & Entrepreneurship and Professional", "Media & Entertainment",
  "Mining", "Other", "People with Disability", "Power",
  "Production and Manufacturing", "Retailers Association's", "Rubber",
  "Service", "Services including Repair and Maintenance", "Telecom", "textile",
  "Tourism & Hospitality", "Transportation", "Waste Management"
  
];
// Sort alphabetically for better usability
sectorList.sort();

const Profile = () => {
    const { user,markProfileAsCreated } = useAuth();
    const token = user?.token;
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        mobileNumber: '',
        city: '',
        highestQualification: '',
        occupation: '',
        workExperience: '',
        interests: '',
        profilePicture: '',
        recommendations: [], // Will be directly modified
    });

    // REMOVED: selectedSectors state is no longer needed

    // State for form submission status
    const [submitStatus, setSubmitStatus] = useState(apiStatus.initial);
    // State for initial data loading
    const [initialLoading, setInitialLoading] = useState(true);
    // State for success message visibility
    const [showSuccess, setShowSuccess] = useState(false);
    // State for error messages
    const [error, setError] = useState('');
    // Local state for profile existence UI
    const [profileExists, setProfileExists] = useState(null);

    // --- Fetch Profile Data Effect ---
    useEffect(() => {
        const fetchProfile = async () => {
            setInitialLoading(true);
            setError('');
            setSubmitStatus(apiStatus.initial);

            try {
                const res = await api.get('/profile/', { // Adjust URL if needed
                    headers: { Authorization: `Bearer ${token}` },
                });
                const profileData = res.data;
                console.log('Profile Page: Raw profile data fetched:', profileData);

                const parsedRecommendations = typeof profileData.recommendations === 'string'
                    ? JSON.parse(profileData.recommendations || '[]')
                    : (Array.isArray(profileData.recommendations) ? profileData.recommendations : []);

                const mappedData = {
                    fullName: profileData.fullname || '',
                    dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
                    gender: profileData.gender || '',
                    mobileNumber: profileData.mobilenumber || '',
                    city: profileData.city || '',
                    highestQualification: profileData.highestqualification || '',
                    occupation: profileData.occupation || '',
                    workExperience: profileData.workexperience || '',
                    interests: profileData.interests || '',
                    profilePicture: profileData.profilepicture || '',
                    recommendations: parsedRecommendations, // Assign fetched recommendations
                };
                console.log('Profile Page: Mapped data for state:', mappedData);

                setFormData(mappedData);
                setProfileExists(true);

            } catch (err) {
                // ... (error handling as before) ...
                 if (err.response && err.response.status === 404) {
                    console.log('Profile Page: Profile not found (404), ready for creation.');
                    setProfileExists(false);
                    setError('');
                 } else {
                    console.error('Profile Page: Error loading profile data:', err.response?.data || err.message, err);
                    setError('Failed to load profile details. Please try again.');
                    setSubmitStatus(apiStatus.error);
                    setProfileExists(null);
                 }
            } finally {
                setInitialLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
           setInitialLoading(false);
           setError("Authentication token not found. Please log in.");
           setSubmitStatus(apiStatus.error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // --- Form Input Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value === null || value === undefined ? '' : value }));
    };

    // --- UPDATED: Recommendation Toggle Handler ---
    const handleRecommendationToggle = (sector) => {
        setFormData((prev) => {
            // Ensure recommendations is treated as an array
            const currentRecommendations = Array.isArray(prev.recommendations) ? prev.recommendations : [];
            let newRecommendations;

            if (currentRecommendations.includes(sector)) {
                // Remove the sector
                newRecommendations = currentRecommendations.filter((s) => s !== sector);
            } else {
                // Add the sector
                newRecommendations = [...currentRecommendations, sector];
            }
            return { ...prev, recommendations: newRecommendations };
        });
    };
    // --- END UPDATED Handler ---

    // REMOVED: addRecommendation function is no longer needed

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(apiStatus.loading);
        setError('');
        setShowSuccess(false);

        const dataToSend = {
            ...formData,
            // recommendations are already in formData state as an array
            recommendations: JSON.stringify(Array.isArray(formData.recommendations) ? formData.recommendations : []),
        };

        const isCreating = !profileExists;

        try {
            const method = isCreating ? 'post' : 'put';
            const url = `/profile/`; // Adjust URL if needed

            await api[method](url, dataToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // --- Success Handling ---
            setSubmitStatus(apiStatus.success);
            setShowSuccess(true); // Trigger success message display
            setProfileExists(true);

            if (isCreating) {
                markProfileAsCreated();
                console.log('Profile created successfully, updating global state.');
                setTimeout(() => navigate('/'), 2000); // Navigate after showing message
            }

            // Set timeout to hide success message after a delay
            const timer = setTimeout(() => {
                setShowSuccess(false);
                if (!isCreating) {
                    setSubmitStatus(apiStatus.initial); // Reset status only on update
                }
            }, 3000); // Message visible for 3 seconds

            // Optional: Clear timer if component unmounts to prevent memory leaks
            return () => clearTimeout(timer);


        } catch (err) {
             // ... (error handling as before) ...
             const errorMsg = err.response?.data?.message || err.message || 'An unknown error occurred.';
             const validationErrors = err.response?.data?.errors;
             console.error(`Error ${isCreating ? 'creating' : 'updating'} profile:`, errorMsg, validationErrors || err);
             setSubmitStatus(apiStatus.error);

             let displayError = `Failed to ${isCreating ? 'create' : 'update'} profile. ${errorMsg}`;
             if (validationErrors) {
                  const formattedErrors = validationErrors.map(e => `${e.param}: ${e.msg}`).join(', ');
                  displayError = `Validation failed: ${formattedErrors}`;
             }
             setError(displayError);
        }
    };

    // --- Render Helper Functions ---
    const renderLoadingView = (message = "Loading...") => (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{message}</span>
          </div>
          <p className="mt-2">{message}</p>
        </div>
    );

    // UPDATED: Success Message with Fade Animation
    const renderSuccessMessage = () => (
      // Uses Bootstrap's fade and alert classes. Ensure Bootstrap JS is included for the fade effect.
      <div className={`alert alert-success alert-dismissible fade ${showSuccess ? 'show' : ''}`} role="alert">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Success:">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        {/* FIX: Use profileExists state to determine text */}
        Profile {profileExists ? 'updated' : 'created'} successfully!
         <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} aria-label="Close"></button>
      </div>
  );

    const renderErrorMessage = () => (
        error ? <div className="alert alert-danger text-center mt-3">❌ {error}</div> : null
    );

    // --- Render Profile Form ---
    const renderProfileForm = () => (
        <form onSubmit={handleSubmit} key={profileExists ? 'update' : 'create'} noValidate> {/* Added noValidate to rely on backend validation */}
             {/* Success/Error Message Area */}
             <div className="message-area mb-3">
                {submitStatus === apiStatus.error && renderErrorMessage()}
                {/* Success message will show here due to state change */}
                {renderSuccessMessage()}
             </div>

            {user?.userId && <p className="text-muted text-center mb-3">User ID: {user.userId}</p>}
            <div className="row g-3">
                 {/* --- Other Form Fields (as before) --- */}
                 {/* Full Name */}
                 <div className="col-md-6">
                    <label htmlFor="fullName" className="form-label fw-medium">Full Name</label>
                    <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
                 </div>
                 {/* Date of Birth */}
                 <div className="col-md-6">
                    <label htmlFor="dob" className="form-label fw-medium">Date of Birth</label>
                    <input type="date" className="form-control" id="dob" name="dob" value={formData.dob || ''} onChange={handleChange} />
                 </div>
                 {/* Gender */}
                 <div className="col-md-6">
                     <label htmlFor="gender" className="form-label fw-medium">Gender</label>
                     <select className="form-select" id="gender" name="gender" value={formData.gender || ''} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                     </select>
                 </div>
                 {/* Mobile Number */}
                 <div className="col-md-6">
                    <label htmlFor="mobileNumber" className="form-label fw-medium">Mobile Number</label>
                    <input type="tel" className="form-control" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} />
                 </div>
                 {/* City */}
                 <div className="col-md-6">
                    <label htmlFor="city" className="form-label fw-medium">City</label>
                    <input type="text" className="form-control" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
                 </div>
                 {/* Highest Qualification */}
                 <div className="col-md-6">
                    <label htmlFor="highestQualification" className="form-label fw-medium">Highest Qualification</label>
                    <input type="text" className="form-control" id="highestQualification" name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange} />
                 </div>
                 {/* Occupation */}
                 <div className="col-md-6">
                    <label htmlFor="occupation" className="form-label fw-medium">Occupation</label>
                    <input type="text" className="form-control" id="occupation" name="occupation" value={formData.occupation || ''} onChange={handleChange} />
                 </div>
                 {/* Work Experience */}
                 <div className="col-md-6">
                    <label htmlFor="workExperience" className="form-label fw-medium">Work Experience (e.g., 5 years)</label>
                    <input type="text" className="form-control" id="workExperience" name="workExperience" value={formData.workExperience || ''} onChange={handleChange} />
                 </div>
                 {/* Interests */}
                 <div className="col-12">
                    <label htmlFor="interests" className="form-label fw-medium">Interests (comma-separated)</label>
                    <input type="text" className="form-control" id="interests" name="interests" value={formData.interests || ''} onChange={handleChange} />
                 </div>
                 {/* Profile Picture URL */}
                 <div className="col-12">
                    <label htmlFor="profilePicture" className="form-label fw-medium">Profile Picture URL</label>
                    <input type="url" className="form-control" id="profilePicture" name="profilePicture" placeholder="http://example.com/image.jpg" value={formData.profilePicture || ''} onChange={handleChange} />
                    {formData.profilePicture && <img src={formData.profilePicture} alt="Profile Preview" className="img-thumbnail mt-2 rounded" style={{ maxHeight: '100px', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'}/> }
                 </div>
                 {/* --- END Other Form Fields --- */}


                 {/* --- UPDATED Sector Recommendations Section --- */}
                 <div className="col-12">
                    <label className="form-label fw-medium mb-2">Your Recommended Sectors (Select/Deselect)</label>
                    <div className="sector-selection-box border rounded p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <div className="row">
                            {sectorList.map(sector => (
                                <div className="col-md-6 col-lg-4" key={sector}> {/* Adjust columns as needed */}
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`sector-${sector.replace(/\s+/g, '-')}`} // Create unique ID
                                            // Check if the sector is in the current formData recommendations array
                                            checked={Array.isArray(formData.recommendations) && formData.recommendations.includes(sector)}
                                            // Call the toggle handler on change
                                            onChange={() => handleRecommendationToggle(sector)}
                                        />
                                        <label className="form-check-label" htmlFor={`sector-${sector.replace(/\s+/g, '-')}`}>
                                            {sector}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Display selected count (optional) */}
                    <div className="form-text mt-1">
                        Selected: {Array.isArray(formData.recommendations) ? formData.recommendations.length : 0} sector(s)
                    </div>
                 </div>
                 {/* --- END UPDATED Section --- */}

            </div>

            {/* --- Action Buttons --- */}
           <div className="d-grid gap-2 mt-4 pt-3 border-top">
                <button
                   type="submit"
                   className="btn btn-primary btn-lg" // Larger button
                   disabled={submitStatus === apiStatus.loading}
                >
                   {submitStatus === apiStatus.loading
                       ? (<> <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving... </>)
                       : (profileExists ? 'Save Changes' : 'Create Profile') // Adjusted text
                   }
                </button>

           </div>
        </form>
    );

    // --- Render Main Content Logic ---
    const renderContent = () => {
        if (initialLoading) {
            return renderLoadingView("Loading profile data...");
        }
        // Only show main fetch error if profile state is still unknown
        if (profileExists === null && error) {
             // Keep the error message specific to fetch failure
             return error ? <div className="alert alert-danger text-center mt-3">❌ {error}</div> : null;
        }
        // If profile state is known (true or false), render the form area
        // The form area itself will handle showing submission errors/success
        if (profileExists !== null) {
            return renderProfileForm();
        }
        // Fallback or initial state before token check?
        return null; // Or some placeholder if needed
    };

    // --- Component Return ---
    return (
        <>
            <Header />
            <div className="container py-4 py-md-5"> {/* Adjusted padding */}
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        {/* Removed card for a cleaner look, direct content */}
                        <div className="profile-content-area p-3 p-md-4 bg-white rounded shadow-sm">
                                <h2 className="text-center text-primary mb-4 fw-bold">
                                    {initialLoading ? "Loading..." : (profileExists ? "Your Profile" : "Create Your Profile")}
                                </h2>

                                {/* Informational message for creation */}
                                {profileExists === false && submitStatus !== apiStatus.success && (
                                     <div className="alert alert-info text-center mb-4">
                                         Please complete your profile to unlock personalized features.
                                     </div>
                                 )}

                                {/* Render main content (form or loading/error) */}
                                {renderContent()}
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;








































// // src/pages/Profile/index.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../Context/AuthContext';
// import Header from '../Header'; // Or your actual Header/Navbar component path
// import { api } from '../../Api/api'; // Adjust path to your api instance
// import { useNavigate } from 'react-router-dom';

// // Define API status constants
// const apiStatus = {
//   initial: 'INITIAL',
//   loading: 'LOADING',
//   success: 'SUCCESS',
//   error: 'ERROR',
// };

// // List of sectors
// const sectorList = [
//   'Agriculture', 'Textiles', 'IT', 'Healthcare', 'Manufacturing',
//   'Construction', 'Tourism', 'Retail', 'Education', 'Logistics',
// ];


// const Profile = () => {
//     const { user, logout, markProfileAsCreated } = useAuth();
//     const token = user?.token;
//     const navigate = useNavigate();

//     // State for form data using camelCase keys
//     const [formData, setFormData] = useState({
//         fullName: '',
//         dob: '', // Date input handles empty string well
//         gender: '',
//         mobileNumber: '',
//         city: '',
//         highestQualification: '',
//         occupation: '',
//         workExperience: '',
//         interests: '',
//         profilePicture: '',
//         recommendations: [],
//     });

//     // State for selected sectors before adding them to recommendations
//     const [selectedSectors, setSelectedSectors] = useState([]);

//     // State for managing API call status during form submission
//     const [submitStatus, setSubmitStatus] = useState(apiStatus.initial);

//     // State for managing initial data loading
//     const [initialLoading, setInitialLoading] = useState(true);

//     // State for controlling visibility of success message
//     const [showSuccess, setShowSuccess] = useState(false);

//     // State for storing error messages
//     const [error, setError] = useState('');

//     // Local state to track if a profile exists for the form UI (distinct from global AuthContext state)
//     const [profileExists, setProfileExists] = useState(null); // null: unknown, false: doesn't exist, true: exists

//     // Effect to fetch profile data on component mount or when token changes
//     useEffect(() => {
//         const fetchProfile = async () => {
//             setInitialLoading(true);
//             setError('');
//             setSubmitStatus(apiStatus.initial); // Reset submit status on fetch

//             try {
//                 // Ensure the URL matches your backend route (e.g., includes /api prefix if needed)
//                 const res = await api.get('/profile/', { // Adjust URL if your backend uses /api/profile/
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 const profileData = res.data;
//                 console.log('Profile Page: Raw profile data fetched:', profileData);

//                 // Ensure recommendations is an array
//                 const parsedRecommendations = typeof profileData.recommendations === 'string'
//                     ? JSON.parse(profileData.recommendations || '[]')
//                     : (Array.isArray(profileData.recommendations) ? profileData.recommendations : []);

//                 // --- MAP BACKEND KEYS (likely lowercase) TO FRONTEND STATE KEYS (camelCase) ---
//                 const mappedData = {
//                     fullName: profileData.fullname || '', // map fullname -> fullName
//                     dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
//                     gender: profileData.gender || '',
//                     mobileNumber: profileData.mobilenumber || '', // map mobilenumber -> mobileNumber
//                     city: profileData.city || '',
//                     highestQualification: profileData.highestqualification || '', // map highestqualification -> highestQualification
//                     occupation: profileData.occupation || '',
//                     workExperience: profileData.workexperience || '', // map workexperience -> workExperience
//                     interests: profileData.interests || '',
//                     profilePicture: profileData.profilepicture || '', // map profilepicture -> profilePicture
//                     recommendations: parsedRecommendations,
//                     // user_id from profileData is usually not needed in the form state itself
//                 };
//                 // --- END MAPPING ---

//                 console.log('Profile Page: Mapped data for state:', mappedData); // Log the mapped data

//                 setFormData(mappedData); // Use the correctly mapped data
//                 setProfileExists(true); // Set local state indicating profile exists

//             } catch (err) {
//                 if (err.response && err.response.status === 404) {
//                     console.log('Profile Page: Profile not found (404), ready for creation.');
//                     setProfileExists(false); // Set local state indicating profile doesn't exist
//                     setError(''); // Clear error message if it's just a 404
//                 } else {
//                     console.error('Profile Page: Error loading profile data:', err.response?.data || err.message, err);
//                     setError('Failed to load profile details. Please try again.');
//                     setSubmitStatus(apiStatus.error); // Set submit status to error
//                     setProfileExists(null); // Unknown profile status due to error
//                 }
//             } finally {
//                 setInitialLoading(false); // Loading finished
//             }
//         };

//         if (token) {
//             fetchProfile();
//         } else {
//            setInitialLoading(false); // Not logged in, stop loading
//            setError("Authentication token not found. Please log in.");
//            setSubmitStatus(apiStatus.error); // Set status to error
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [token]); // Re-run only if token changes

//     // Handle changes in form inputs
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         // Ensure that even if a value somehow becomes null/undefined, it defaults to '' for controlled input
//         setFormData((prev) => ({ ...prev, [name]: value === null || value === undefined ? '' : value }));
//     };

//     // Handle sector checkbox changes
//     const handleSectorChange = (sector) => {
//         setSelectedSectors((prev) =>
//         prev.includes(sector)
//             ? prev.filter((s) => s !== sector)
//             : [...prev, sector]
//         );
//     };

//     // Add selected sectors to the main recommendations list in formData
//     const addRecommendation = () => {
//         // Ensure recommendations is always an array before spreading
//         const currentRecommendations = Array.isArray(formData.recommendations) ? formData.recommendations : [];
//         const unique = [...new Set([...currentRecommendations, ...selectedSectors])];
//         setFormData((prev) => ({ ...prev, recommendations: unique }));
//         setSelectedSectors([]); // Clear selection after adding
//     };

//     // Handle form submission (Create or Update)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSubmitStatus(apiStatus.loading); // Set loading status
//         setError(''); // Clear previous errors
//         setShowSuccess(false); // Hide previous success message

//         // Prepare data payload - ensure recommendations is stringified
//         const dataToSend = {
//             ...formData, // Use current form data (camelCase keys match backend expectations if backend updated, otherwise backend handles it)
//             recommendations: JSON.stringify(Array.isArray(formData.recommendations) ? formData.recommendations : []), // Ensure stringified array
//         };

//         // Determine if we are creating or updating based on local state
//         const isCreating = !profileExists;

//         try {
//             const method = isCreating ? 'post' : 'put';
//             // Adjust URL if your backend expects /api/profile/
//             const url = `/profile/`;

//             // Make the API call
//             await api[method](url, dataToSend, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             // --- Success Handling ---
//             setSubmitStatus(apiStatus.success); // Set success status
//             setShowSuccess(true); // Show success message
//             setProfileExists(true); // Profile now definitely exists (or is updated)

//             // If creating, update global state and navigate
//             if (isCreating) {
//                 markProfileAsCreated(); // Update AuthContext state
//                 console.log('Profile created successfully, updating global state.');
//                 // Navigate after a short delay to allow user to see success message
//                 setTimeout(() => {
//                      navigate('/'); // Navigate to home or dashboard after creation
//                 }, 2000); // Shorter delay before navigation
//             }

//             // Hide success message after a delay (for both create and update)
//             setTimeout(() => {
//                 setShowSuccess(false);
//                 // Reset status only if not navigating away (i.e., on update)
//                 if (!isCreating) {
//                     setSubmitStatus(apiStatus.initial);
//                 }
//             }, 2500); // Keep message visible slightly longer

//         } catch (err) {
//             // --- Error Handling ---
//             const errorMsg = err.response?.data?.message || err.message || 'An unknown error occurred.';
//             const validationErrors = err.response?.data?.errors; // Check for validation errors from backend
//             console.error(`Error ${isCreating ? 'creating' : 'updating'} profile:`, errorMsg, validationErrors || err);
//             setSubmitStatus(apiStatus.error); // Set error status

//             let displayError = `Failed to ${isCreating ? 'create' : 'update'} profile. ${errorMsg}`;
//             if (validationErrors) {
//                  // Format validation errors nicely if available
//                  const formattedErrors = validationErrors.map(e => `${e.param}: ${e.msg}`).join(', ');
//                  displayError = `Validation failed: ${formattedErrors}`;
//             }
//             setError(displayError);
//         }
//     };

//     // Render loading spinner
//     const renderLoadingView = (message = "Loading...") => (
//         <div className="text-center py-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">{message}</span>
//           </div>
//           <p className="mt-2">{message}</p>
//         </div>
//     );

//     // Render success message
//     const renderSuccessMessage = () => (
//         <div className="alert alert-success text-center mt-3">
//           ✅ Profile {profileExists ? 'updated' : 'created'} successfully!
//         </div>
//     );

//     // Render error message
//     const renderErrorMessage = () => (
//         // Only render if error state has a message
//         error ? <div className="alert alert-danger text-center mt-3">❌ {error}</div> : null
//     );


//     // Render the main profile form
//     const renderProfileForm = () => (
//         // Use a key based on profileExists to force re-mount when switching between create/update, ensuring initial values load correctly
//         <form onSubmit={handleSubmit} key={profileExists ? 'update' : 'create'}>
//             {user?.userId && <p className="text-muted text-center mb-3">User ID: {user.userId}</p>}
//             <div className="row g-3">
//                  {/* Full Name */}
//                  <div className="col-md-6">
//                     <label htmlFor="fullName" className="form-label">Full Name</label>
//                     <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName || ''} onChange={handleChange} required />
//                  </div>
//                  {/* Date of Birth */}
//                  <div className="col-md-6">
//                     <label htmlFor="dob" className="form-label">Date of Birth</label>
//                     <input type="date" className="form-control" id="dob" name="dob" value={formData.dob || ''} onChange={handleChange} />
//                  </div>
//                  {/* Gender */}
//                  <div className="col-md-6">
//                      <label htmlFor="gender" className="form-label">Gender</label>
//                      <select className="form-select" id="gender" name="gender" value={formData.gender || ''} onChange={handleChange}>
//                         <option value="">Select Gender</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                      </select>
//                  </div>
//                  {/* Mobile Number */}
//                  <div className="col-md-6">
//                     <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
//                     <input type="tel" className="form-control" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} />
//                  </div>
//                  {/* City */}
//                  <div className="col-md-6">
//                     <label htmlFor="city" className="form-label">City</label>
//                     <input type="text" className="form-control" id="city" name="city" value={formData.city || ''} onChange={handleChange} />
//                  </div>
//                  {/* Highest Qualification */}
//                  <div className="col-md-6">
//                     <label htmlFor="highestQualification" className="form-label">Highest Qualification</label>
//                     <input type="text" className="form-control" id="highestQualification" name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange} />
//                  </div>
//                  {/* Occupation */}
//                  <div className="col-md-6">
//                     <label htmlFor="occupation" className="form-label">Occupation</label>
//                     <input type="text" className="form-control" id="occupation" name="occupation" value={formData.occupation || ''} onChange={handleChange} />
//                  </div>
//                  {/* Work Experience */}
//                  <div className="col-md-6">
//                     <label htmlFor="workExperience" className="form-label">Work Experience (e.g., 5 years)</label>
//                     <input type="text" className="form-control" id="workExperience" name="workExperience" value={formData.workExperience || ''} onChange={handleChange} />
//                  </div>
//                  {/* Interests */}
//                  <div className="col-12">
//                     <label htmlFor="interests" className="form-label">Interests (comma-separated)</label>
//                     <input type="text" className="form-control" id="interests" name="interests" value={formData.interests || ''} onChange={handleChange} />
//                  </div>
//                  {/* Profile Picture URL */}
//                  <div className="col-12">
//                     <label htmlFor="profilePicture" className="form-label">Profile Picture URL</label>
//                     <input type="url" className="form-control" id="profilePicture" name="profilePicture" placeholder="http://example.com/image.jpg" value={formData.profilePicture || ''} onChange={handleChange} />
//                     {/* Basic check if profilePicture has a value before rendering img */}
//                     {formData.profilePicture && <img src={formData.profilePicture} alt="Profile Preview" className="img-thumbnail mt-2" style={{ maxHeight: '100px' }} onError={(e) => e.target.style.display='none'}/> /* Hide if image fails to load */}
//                  </div>
//                  {/* Sector Recommendations */}
//                  <div className="col-12">
//                     <label className="form-label">Select Sector Recommendations:</label>
//                     <div className="mb-2" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', padding: '10px', borderRadius: '0.25rem' }}>
//                     {sectorList.map(sector => (
//                         <div className="form-check" key={sector}>
//                         <input
//                             className="form-check-input"
//                             type="checkbox"
//                             id={`sector-${sector}`}
//                             // Ensure selectedSectors is always an array
//                             checked={(Array.isArray(selectedSectors) ? selectedSectors : []).includes(sector)}
//                             onChange={() => handleSectorChange(sector)}
//                         />
//                         <label className="form-check-label" htmlFor={`sector-${sector}`}>
//                             {sector}
//                         </label>
//                         </div>
//                     ))}
//                     </div>
//                     <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={addRecommendation} disabled={!Array.isArray(selectedSectors) || selectedSectors.length === 0}>
//                     Add Selected to Recommendations
//                     </button>
//                  </div>
//                  {/* Display Current Recommendations */}
//                  <div className="col-12">
//                      <label className="form-label">Your Current Recommendations:</label>
//                      <div className="p-2 bg-light border rounded">
//                          {/* Check if formData.recommendations is an array before join */}
//                          {Array.isArray(formData.recommendations) && formData.recommendations.length > 0 ? formData.recommendations.join(', ') : <span className="text-muted">None selected</span>}
//                      </div>
//                  </div>
//             </div>
//             {/* Action Buttons */}
//            <div className="d-grid gap-2 mt-4">
//                 <button
//                    type="submit"
//                    className="btn btn-primary"
//                    disabled={submitStatus === apiStatus.loading} // Disable button when submitting
//                 >
//                    {submitStatus === apiStatus.loading // Show spinner and text when loading
//                        ? (<> <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving... </>)
//                        : (profileExists ? 'Update Profile' : 'Create Profile') // Dynamic button text
//                    }
//                    </button>
//                 <button type="button" className="btn btn-outline-danger" onClick={logout}>
//                    Logout
//                 </button>
//            </div>
//         </form>
//     );

//     // Render component content based on overall state
//     const renderContent = () => {
//         // Show initial loading spinner
//         if (initialLoading) {
//             return renderLoadingView("Loading profile data...");
//         }

//         // Show error message if fetch failed critically and we don't know profile state
//         if (profileExists === null && error) {
//             return renderErrorMessage();
//         }

//         // If profile state is known (true or false), proceed to render form and messages
//         return (
//             <>
//                 {/* Show submission status messages above the form */}
//                 {submitStatus === apiStatus.error && renderErrorMessage()}
//                 {submitStatus === apiStatus.success && showSuccess && renderSuccessMessage()}

//                 {/* Always render the form if profile state is known */}
//                 {profileExists !== null && renderProfileForm()}
//             </>
//         );
//     };

//     // Main component return
//     return (
//         <>
//             <Header /> {/* Ensure Header component is correctly imported and rendered */}
//             <div className="container py-5">
//                 <div className="row justify-content-center">
//                     <div className="col-md-10 col-lg-8">
//                         <div className="card shadow-sm border-0">
//                             <div className="card-body p-4 p-md-5">
//                                 <h2 className="text-center text-primary mb-4">
//                                     {/* Dynamic title based on loading and profile existence state */}
//                                     {initialLoading ? "Loading..." : (profileExists ? "Update Your Profile" : "Create Your Profile")}
//                                 </h2>

//                                 {/* Informational message specific to creation state */}
//                                 {profileExists === false && submitStatus !== apiStatus.success && (
//                                      <div className="alert alert-info text-center">
//                                          Please complete your profile to continue.
//                                      </div>
//                                  )}

//                                 {/* Render main content (form, messages, etc.) */}
//                                 {renderContent()}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Profile;