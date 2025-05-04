import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Adjust path as needed

// Import Bootstrap Icons (optional)
// import 'bootstrap-icons/font/bootstrap-icons.css';

const Header = () => {
  const { logout } = useAuth();
  const logoutModalId = "logoutConfirmModal";

  const handleConfirmLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center" to="/">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-briefcase-fill me-2" viewBox="0 0 16 16">
                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3h6v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65zM0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5v1.384l-7.614 2.03a1.5 1.5 0 0 1-.772 0L0 5.884V4.5z"/>
             </svg>
            ShramikSetu
          </Link>

          {/* Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavContent"
            aria-controls="navbarNavContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content - ADD align-items-center HERE */}
          <div className="collapse navbar-collapse align-items-center" id="navbarNavContent"> {/* <-- FIX: Added align-items-center */}

            {/* Navigation Links */}
            <ul className="navbar-nav ms-auto"> {/* REMOVED align-items-lg-center from here */}
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/" end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/job">
                  Jobs
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile">
                  Profile
                </NavLink>
              </li>
            </ul>

            {/* Separator & Logout Button Area - Placed AFTER the ul */}
            {/* Use ms-lg-3 for margin start on large screens */}
             <div className="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0"> {/* Use flex container for separator and button */}
                {/* Separator visible only on large screens */}
                <span className="text-muted d-none d-lg-inline-block me-3">|</span>

                {/* Logout Button - Triggers Modal */}
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm" // Keep it small or adjust as needed
                  data-bs-toggle="modal"
                  data-bs-target={`#${logoutModalId}`}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right me-1" viewBox="0 0 16 16">
                       <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                       <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                   </svg>
                  Logout
                </button>
             </div>
          </div> {/* End navbar-collapse */}
        </div> {/* End container */}
      </nav>

      {/* Logout Confirmation Modal (Keep this structure as is) */}
      <div
        className="modal fade"
        id={logoutModalId}
        tabIndex="-1"
        aria-labelledby={`${logoutModalId}Label`}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`${logoutModalId}Label`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill text-warning me-2" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                 </svg>
                Confirm Logout
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to log out?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmLogout}
                data-bs-dismiss="modal"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;