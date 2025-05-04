// AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { login as apiLogin, api } from '../Api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    // --- New State ---
    const [profileExists, setProfileExists] = useState(null); // null = unknown, true = exists, false = not exists
    const [isCheckingProfile, setIsCheckingProfile] = useState(false);
    // --- End New State ---
    const navigate = useNavigate();
    const location = useLocation(); // To know the current path

    // Function to check profile status (memoized with useCallback)
    const checkUserProfileStatus = useCallback(async (currentToken) => {
        if (!currentToken) {
            console.log("checkUserProfileStatus: No token, skipping check.");
            setProfileExists(null); // Reset if no token
            return;
        }
        console.log("checkUserProfileStatus: Checking profile...");
        setIsCheckingProfile(true);
        setProfileExists(null); // Assume unknown while checking
        try {
            // Use GET /profile/ which returns 200 if exists, 404 if not
            await api.get('/profile/', {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            console.log("checkUserProfileStatus: Profile exists.");
            setProfileExists(true); // Profile found (status 200)
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log("checkUserProfileStatus: Profile does not exist (404).");
                setProfileExists(false); // Profile not found
            } else {
                console.error('checkUserProfileStatus: Error checking profile status:', error.response?.data || error.message);
                setProfileExists(null); // Error occurred, status unknown
            }
        } finally {
            setIsCheckingProfile(false);
            console.log("checkUserProfileStatus: Check complete.");
        }
    }, []); // No dependencies needed if 'api' is stable

    // Effect to load user from cookies and check profile on initial load
    useEffect(() => {
        const token = Cookies.get('token');
        const role = Cookies.get('role');
        const userId = Cookies.get('userId');

        if (token && role && userId) {
            console.log("AuthProvider Initial Load: Found user in cookies.", { userId, role });
            setUser({ token, role, userId });
            checkUserProfileStatus(token); // Check profile status for the logged-in user
        } else {
            console.log("AuthProvider Initial Load: No valid user session found in cookies.");
            setUser(null);
            setProfileExists(null); // Ensure profile status is reset if no user
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkUserProfileStatus]); // Run checkUserProfileStatus if it changes (it shouldn't due to useCallback)

    // Login function
    const login = async (email, password) => {
        try {
            const { token, user: loggedInUserDetails } = await apiLogin(email, password);
            const decoded = JSON.parse(atob(token.split('.')[1]));

            if (!decoded.id || !decoded.role) {
                throw new Error("Token payload is missing required fields (id, role).");
            }

            const userId = decoded.id.toString();
            const userRole = decoded.role;

            Cookies.set('token', token, { expires: 7 });
            Cookies.set('role', userRole, { expires: 7 });
            Cookies.set('userId', userId, { expires: 7 });

            const currentUser = { token, role: userRole, userId: userId };
            setUser(currentUser);
            console.log("Login successful:", currentUser);

                 // --- Inline Profile Check & Redirect ---
            // Immediately check profile status to decide navigation
            try {
              console.log("Login: Checking profile status immediately...");
              // Use the fresh token to check profile
              await api.get('/profile/', { // <<< CHECK THIS URL (needs /api/ ?)
                  headers: { Authorization: `Bearer ${token}` },
              });
              // SUCCESS (Profile Exists - Status 200 OK)
              console.log("Login: Profile exists. Redirecting to Home (/).");
              setProfileExists(true); // Update global state
              navigate('/'); // <<< REDIRECT TO HOME

          } catch (profileError) {
               // CHECK if 404 means profile doesn't exist
              if (profileError.response && profileError.response.status === 404) {
                  // PROFILE DOES NOT EXIST
                  console.log("Login: Profile does NOT exist (404). Redirecting to /profile.");
                  setProfileExists(false); // Update global state
                  navigate('/profile'); // <<< REDIRECT TO PROFILE

              } else {
                  // OTHER ERROR during profile check (e.g., 500)
                  console.error("Login: Error checking profile status after login:", profileError.response?.data || profileError.message);
                  setProfileExists(null); // Set state to unknown on error
                  // Fallback navigation: Navigate home even if profile check failed.
                  // ProtectedRoute will still catch 'null' or 'false' if needed later.
                  console.log("Login: Profile check failed (non-404). Navigating home (/) as fallback.");
                  navigate('/'); // <<< FALLBACK TO HOME
              }
          }
            // Navigation logic will now be handled by ProtectedRoute based on profileExists state

        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            setUser(null); // Ensure user state is null on login failure
            setProfileExists(null); // Reset profile status
            Cookies.remove('token'); // Clean up cookies on failed login
            Cookies.remove('role');
            Cookies.remove('userId');
            throw error; // Re-throw for the component to handle
        }
    };

    // Logout function
    const logout = () => {
        console.log('Logging out...');
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('userId');
        setUser(null);
        setProfileExists(null); // Reset profile status on logout
        navigate('/login');
    };


    // --- New Function ---
    // Function for ProfilePage to call after successful creation
    const markProfileAsCreated = () => {
        console.log("AuthContext: Marking profile as created.");
        setProfileExists(true);
    };
    // --- End New Function ---

    const value = {
        user,
        login,
        logout,
        api,
        // Expose profile status and update function
        profileExists,
        isCheckingProfile,
        markProfileAsCreated,
        checkUserProfileStatus // Expose if manual re-check is ever needed
        
        
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};



















// // AuthContext.js
// import React, { createContext, useContext, useEffect, useId, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { login as apiLogin } from '../Api/api'; // Import the login function from api.js
// import {api} from '../Api/api'; // Import the api instance

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = Cookies.get('token');
//     const role = Cookies.get('role');
//     const userId = Cookies.get('userId');
//     if (token && role) setUser({ token, role ,userId});
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const { token, user } = await apiLogin(email, password);  // Use apiLogin from api.js
//       const decoded = JSON.parse(atob(token.split('.')[1]));
//       Cookies.set('token', token);
//       Cookies.set('role', decoded.role);
//       Cookies.set('username', user.username);
//       Cookies.set('email', user.email);
//       Cookies.set('userId', decoded.id);
//       setUser({ token, role: decoded.role, userId: decoded.id });
//       // ⬇️ Check if profile exists
//       const res = await api.get(`/profile/${user.useId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // ⬇️ If profile exists, navigate to home or jobs page
//       console.log('Profile exists:', res.data.exists);

//       if (res.data.exists) {
//         navigate('/'); // or wherever you want users to land normally
//       } else {
//         console.log('Profile not filled, redirecting to profile page');
//         navigate('/profile'); // force fill profile
//       }

//     } catch (error) {
//       console.error('Login failed', error);
//     }
//   };

//   const logout = () => {
//     Cookies.remove('token');
//     Cookies.remove('role');
//     Cookies.remove('username');
//     Cookies.remove('email');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
