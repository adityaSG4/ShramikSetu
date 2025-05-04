import Header from '../Header';
import { Link } from 'react-router-dom';
import './index.css';

const NotFound = () => (
  <>
    <Header />
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center px-3 px-md-5">
        <img
          src="https://assets.ccbp.in/frontend/react-js/jobby-app-not-found-img.png"
          alt="not found"
          className="img-fluid mb-4"
          style={{ maxWidth: '300px' }}
        />
        <h1 className="display-6 fw-bold text-danger mb-3">Page Not Found</h1>
        <p className="fs-5 text-muted mb-4">
          We’re sorry, the page you’re looking for doesn’t exist.
        </p>
        <Link to="/" className="btn btn-outline-primary px-4">
          ⬅️ Back to Home
        </Link>
      </div>
    </div>
  </>
);

export default NotFound;
