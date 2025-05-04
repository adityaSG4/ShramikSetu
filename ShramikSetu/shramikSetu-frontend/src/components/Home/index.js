import { Link } from 'react-router-dom';
import Header from '../Header';
import RecommandedJobCard from '../RecommandedJobCard'; // Assuming this accepts a 'job' prop
import { RiArrowDownWideLine } from "react-icons/ri";
import './index.css'; // Renamed CSS file for clarity (or keep index.css)




const Home = () => (
  <>
    <Header />

    {/* --- Hero Section --- */}
    <section className="hero-section container-fluid bg-white d-flex flex-column align-items-center justify-content-center position-relative">
      <div className="text-center px-3 py-5 py-md-0"> {/* Added more padding for smaller screens */}
        <h1 className="display-4 fw-bold text-primary mb-3"> {/* Slightly smaller display size */}
          Find The Job That Fits Your Life
        </h1>
        <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '700px' }}> {/* Use 'lead' for prominence, constrain width */}
          Millions are searching for jobs, salary info, & company reviews.
          Discover opportunities matching your skills and potential.
        </p>
        <Link to="/job"> {/* Changed link to plural '/jobs' (common practice) */}
          <button className="btn btn-primary btn-lg px-4 shadow-sm">
            <span role="img" aria-label="magnifying glass">🔍</span> Find Jobs
          </button>
        </Link>
      </div>

      {/* --- Scroll Down Indicator --- */}
      <div className="scroll-indicator text-center position-absolute bottom-0 mb-4">
         {/* Removed icon text to make it cleaner */}
        <RiArrowDownWideLine className="arrow-icon text-muted" size={30} />
      </div>
    </section>

    {/* --- Recommendations Section --- */}
    <section className="recommendations-section bg-light py-5">
      <div className="container"> {/* Use container for centered content */}
        <h2 className="display-6 fw-bold text-primary mb-5 text-center"> {/* Increased bottom margin */}
          Recommended Jobs For You
        </h2>

          <div className="row g-4"> 
                <RecommandedJobCard/>
           
          </div>
        
         <div className="text-center mt-5">
           <Link to="/job" className="btn btn-outline-primary">
             View All Jobs
           </Link>
         </div>
      </div>
    </section>
  </>
);

export default Home;