// src/components/RedirectIfAuth.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Adjust the import path as necessary

/**
 * Redirects to a specified path (usually home '/') if the user is already authenticated.
 * Useful for preventing logged-in users from accessing Login/Register pages.
 */
const RedirectIfAuth = ({ children, redirectTo = "/" }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Where did the user try to go *before* logging in (if redirected from protected route)?
    const from = location.state?.from?.pathname;

    // If user is logged in...
    if (user) {
        // Redirect them away from the auth page.
        // If they were previously redirected *to* login from a protected page, send them back there.
        // Otherwise, send them to the default redirectTo path (home).
        const redirectPath = from || redirectTo;
        console.log(`RedirectIfAuth: User already logged in. Redirecting from ${location.pathname} to ${redirectPath}.`);
        return <Navigate to={redirectPath} replace />; // 'replace' prevents adding login/register to history
    }

    // If user is not logged in, render the child component (Login or Register page)
    return children;
};

export default RedirectIfAuth;