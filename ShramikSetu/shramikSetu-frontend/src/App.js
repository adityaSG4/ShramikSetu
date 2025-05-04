import React from 'react'; // Make sure React is imported
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Router

// Your Page Components
import Home from './components/Home';
import Jobs from './components/Jobs';
import NotFound from './components/NotFound';
import JobItemDetails from './components/JobItemDetails';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile';

// Import Auth and Protection Components (Adjust paths if necessary)
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAuth from './components/RequireAuth';
import RedirectIfAuth from './components/RedirectIfAuth';

import './App.css';

const App = () => (
  // 1. Wrap everything in AuthProvider
  <AuthProvider>
    {/* 2. Ensure you have a Router component (like BrowserRouter) */}

      <Routes>
        {/* Public Routes: Login and Register */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth> {/* <--- WRAP HERE */}
              <Login />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth> {/* <--- WRAP HERE */}
              <Register />
            </RedirectIfAuth>
          }
        />

        {/* Protected Routes (Require Login AND Profile Completion) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/:id"
          element={
            <ProtectedRoute>
              <JobItemDetails />
            </ProtectedRoute>
          }
        />

        {/* Route requiring Login only (Profile page itself) */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Not Found Route (can be public or inside RequireAuth depending on desired behavior) */}
        {/* Keeping it public is usually fine */}
        <Route path="/not-found" element={<NotFound />} />

        {/* Catch-all: Redirects any unmatched routes to /not-found */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>

  </AuthProvider>
);

export default App;