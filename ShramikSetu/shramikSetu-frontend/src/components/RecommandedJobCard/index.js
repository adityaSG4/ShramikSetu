// src/components/RecommandedJobCard/index.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { api, postJobData } from '../../Api/api'; 
import { Link } from 'react-router-dom';

const RecommandedJobCard = () => {
    const { user } = useAuth(); // Get user context
    const token = user?.token;

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasProfile, setHasProfile] = useState(true); // Assume profile exists initially
    const [hasRecommendations, setHasRecommendations] = useState(true); // Assume recommendations exist

    useEffect(() => {
        // Only run if user is logged in
        if (!token) {
            // Optionally clear state if needed when user logs out
            setRecommendedJobs([]);
            setError('');
            setIsLoading(false);
            return;
        }

        const fetchRecommendationsAndJobs = async () => {
            setIsLoading(true);
            setError('');
            setRecommendedJobs([]); // Clear previous jobs
            setHasProfile(true);
            setHasRecommendations(true);

            let profileRecommendations = [];

            // 1. Fetch User Profile to get recommendations
            try {
                const profileRes = await api.get('/profile/', { // Adjust URL if needed
                    headers: { Authorization: `Bearer ${token}` },
                });
                const profileData = profileRes.data;
                console.log('RecommandedJobCard: Profile fetched:', profileData);

                // Ensure recommendations is an array
                profileRecommendations = Array.isArray(profileData.recommendations)
                    ? profileData.recommendations
                    : [];

                if (profileRecommendations.length === 0) {
                    console.log('RecommandedJobCard: No recommendations found in profile.');
                    setHasRecommendations(false);
                    setIsLoading(false); // Stop loading if no recommendations
                    return; // Exit early
                }

            } catch (profileErr) {
                if (profileErr.response && profileErr.response.status === 404) {
                    console.log('RecommandedJobCard: Profile not found (404).');
                    setHasProfile(false);
                } else {
                    console.error('RecommandedJobCard: Error fetching profile:', profileErr);
                    setError('Could not load profile recommendations.');
                }
                setIsLoading(false); // Stop loading on profile error
                return; // Exit early
            }

            // 2. Fetch Jobs based on recommendations (only if recommendations were found)
            console.log('RecommandedJobCard: Fetching jobs for sectors:', profileRecommendations);
            const jobPayload = {
                PageNumber: 1,
                PageSize: 21, // Fetch a limited number for display here
                JobStatus: "Active",
                Sector: profileRecommendations, // Use fetched recommendations
                // Add other default filters if desired, matching your example
                Country: ["India"], // Example default
                // State: ["Assam", "Maharashtra", ...], // Maybe don't filter by state here? Or add later?
                // SourceSystem: ["NSDC JobX", "NCS"], // Example default
                MinSalary: 0,       // Default salary range
                MaxSalary: 100000000,
                Field: "postedOn",
                Order: "desc"
            };

            try {
                const jobsData = await postJobData(jobPayload);
                console.log('RecommandedJobCard: Recommended jobs API response:', jobsData);
                if (jobsData?.Results?.length > 0) {
                    setRecommendedJobs(jobsData.Results);
                } else {
                    console.log('RecommandedJobCard: No jobs found matching recommended sectors.');
                    // No error, just no results
                }
            } catch (jobErr) {
                console.error('RecommandedJobCard: Error fetching recommended jobs:', jobErr);
                setError('Could not load recommended jobs.');
            } finally {
                setIsLoading(false); // Stop loading after job fetch attempt
            }
        };

        fetchRecommendationsAndJobs();

    }, [token]); // Rerun when token changes

    // --- Render Logic ---

    // Don't render anything if not logged in (or tailor message)
    if (!token) {
        return null; // Or <p>Please log in to see recommendations.</p>
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="container py-4 text-center">
                 <h4 className="text-muted mb-3">Loading Recommendations...</h4>
                 <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading...</span>
                 </div>
            </div>
        );
    }

    // Show error message
    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-warning text-center">{error}</div>
            </div>
        );
    }

    // Prompt to create profile if it doesn't exist
    if (!hasProfile) {
         return (
            <div className="container py-4 text-center">
                 <p className="text-muted">Create your profile to get personalized job recommendations.</p>
                 {/* Optional: Link to profile page */}
                 {/* <Link to="/profile" className="btn btn-sm btn-info">Create Profile</Link> */}
            </div>
         );
    }

     // Prompt to add recommendations if profile exists but recommendations are empty
     if (!hasRecommendations) {
        return (
           <div className="container py-4 text-center">
                <p className="text-muted">Add recommended sectors to your profile to see relevant jobs here.</p>
                 {/* Optional: Link to profile page */}
                 {/* <Link to="/profile" className="btn btn-sm btn-info">Update Profile</Link> */}
           </div>
        );
   }


    // Show recommended jobs if found
    if (recommendedJobs.length > 0) {
        return (
            <div className="container py-4 mb-5"> {/* Added mb-5 for spacing */}
                <h3 className="text-center fw-bold text-primary mb-4">✨ Recommended For You ✨</h3>
                <div className="row g-4">
                    {recommendedJobs.map((job) => (
                  <div className="col-md-4" key={job.Id}>
                    <Link to={`/job/${job.Id}`} className="text-decoration-none text-dark">
                      <div className="card h-100 border-0 shadow-sm job-card hover-shadow">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title fw-bold text-primary">{job.JobTitle}</h5>
                          <h6 className="card-subtitle mb-2 text-muted">{job.CompanyName || 'N/A'}</h6>
                          <ul className="list-unstyled small">
                            <li><strong>📍 Location:</strong> {job.JobLocationDistrict || 'N/A'}, {job.JobLocationState || 'N/A'}</li>
                            <li><strong>💰 Salary:</strong> {job.MinCtcMonthly === 0 ? 'Unpaid' : `₹${job.MinCtcMonthly?.toLocaleString()}`}</li>
                            <li><strong>🧑‍💼 Experience:</strong> {job.MinExperience || 0}+ yrs</li>
                            <li><strong>🎓 Qualification:</strong> {job.MinEduQual || 'Not specified'}</li>
                            <li><strong>📦 Vacancies:</strong> {job.VacancyCount || 1}</li>
                          </ul>
                          <div className="mt-auto text-end">
                            <small className="text-muted">🕒  {new Date(job.PostedOn).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}</small>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>))}
                </div>
                 {/* Optional: Link to view all jobs */}
                 {/* <div className="text-center mt-4">
                    <Link to="/job" className="btn btn-outline-primary">
                         View All Jobs ➔
                    </Link>
                 </div> */}
            </div>
        );
    }

    // If profile/recommendations exist but no jobs match
    if (hasProfile && hasRecommendations && recommendedJobs.length === 0) {
        return (
            <div className="container py-4 text-center">
                <p className="text-muted">We couldn't find any open jobs matching your recommended sectors right now.</p>
                {/* Optional: Link to view all jobs */}
                {/* <Link to="/job" className="btn btn-sm btn-secondary">Browse All Jobs</Link> */}
            </div>
        );
    }


    // Fallback case (shouldn't normally be reached)
    return null;
};

export default RecommandedJobCard;