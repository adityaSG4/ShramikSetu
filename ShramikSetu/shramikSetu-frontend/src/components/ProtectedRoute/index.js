// components/ProtectedRoute.js (or similar path)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Adjust path as needed

const ProtectedRoute = ({ children }) => {
    const { user, profileExists, isCheckingProfile } = useAuth();
    const location = useLocation();

    // console.log("ProtectedRoute Check:", {
    //     pathname: location.pathname,
    //     user: !!user,
    //     isCheckingProfile,
    //     profileExists,
    // });

    // 1. If still checking auth OR profile status, show loading
    // (Avoid checking profile if user isn't even logged in)
    if (user && isCheckingProfile) {
         console.log("ProtectedRoute: Checking profile, showing loading...");
         return (
             <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                 <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading user data...</span>
                 </div>
             </div>
         ); // Or a proper loading component
    }

    // 2. If not authenticated, redirect to login
    if (!user) {
        console.log("ProtectedRoute: Not authenticated, redirecting to login.");
        // Pass the original location intentos state so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If authenticated, but profile check resulted in 'false', redirect to profile page
    //    (unless they are *already* trying to access /profile)
    if (user && profileExists === false && location.pathname !== '/profile') {
        console.log("ProtectedRoute: Profile missing, redirecting to /profile.");
        return <Navigate to="/profile" state={{ message: "Please complete your profile." }} replace />;
    }

    // 4. If authenticated and profile exists (or check hasn't failed negatively), allow access
    //    Includes profileExists === true OR profileExists === null (if check failed maybe let them proceed?)
    //    Consider adding specific handling for profileExists === null if check fails critically.
    if (user && (profileExists === true || profileExists === null /* Allow if check failed maybe? */)) {
         console.log("ProtectedRoute: Access granted.");
         return children; // Render the component they were trying to access
    }

    // Fallback case (should ideally not be reached with the logic above)
    // This might catch profileExists === null if you want to redirect then too
     console.log("ProtectedRoute: Fallback, redirecting to login (might indicate an issue).");
    return <Navigate to="/login" state={{ from: location }} replace />;

};

export default ProtectedRoute;