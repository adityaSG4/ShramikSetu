// components/RequireAuth.js (or similar path)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Adjust path as needed

const RequireAuth = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        console.log("RequireAuth: Not authenticated, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log("RequireAuth: Authenticated, allowing access.");
    return children;
};

export default RequireAuth;