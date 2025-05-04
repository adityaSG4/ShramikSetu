import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import { postJobData } from '../../Api/api'; // Ensure path is correct
import { useInView } from 'react-intersection-observer';
import Header from '../Header'; // Ensure path is correct
import { Link } from 'react-router-dom';
import { BsFilterLeft, BsArrowRepeat, BsRocketTakeoffFill } from "react-icons/bs"; // Import react-icons
import './index.css'; // Import the CSS

// --- Constants ---
const sectorsList = [
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
  "Tourism & Hospitality"
].sort();

const sectorsOptions = sectorsList.map(sector => ({
  label: sector,
  value: sector
}));

const salaryOptions = [
  // Add 'all' back for easy reset/default state
  { value: 'all', label: 'Any Salary', min: 0, max: 100000000, icon: '🌐' },
  { value: 'unpaid', label: 'Unpaid / Volunteer', min: 0, max: 0, icon: '💸' },
  { value: 'upto15k', label: '₹1 – ₹15k', min: 1, max: 15000, icon: '💵' },
  { value: 'above15k', label: '₹15k+', min: 15001, max: 100000000, icon: '🤑' },
];

const initialPayload = {
  PageNumber: 1,
  PageSize: 12,
  JobStatus: "Active",
  Sector: [],
  Country: ["India"],
  State: [],
  SourceSystem: [],
  MinSalary: 0,
  MaxSalary: 100000000,
  Field: "postedOn",
  Order: "desc"
};

// --- Component ---
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [selectedSalaryValue, setSelectedSalaryValue] = useState('all');
  const [payload, setPayload] = useState(initialPayload);
  // Use a separate state to track filter changes to avoid unnecessary fetches on page number change
  const [activeFilters, setActiveFilters] = useState({
    Sector: initialPayload.Sector,
    MinSalary: initialPayload.MinSalary,
    MaxSalary: initialPayload.MaxSalary
  });

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // --- Fetching Logic ---
  const fetchJobs = useCallback(async (fetchPayload, isLoadMore = false) => {
    if (loading && !isLoadMore) return; // Prevent re-fetching if already loading filters

    console.log('Fetching jobs with payload:', fetchPayload, 'Load more:', isLoadMore);
    setLoading(true);
    if (!isLoadMore) setError('');

    try {
      const data = await postJobData(fetchPayload); // Ensure this uses the correct endpoint
      console.log('Jobs API response:', data);

      if (data && Array.isArray(data.Results)) {
        setJobs(prev => isLoadMore ? [...prev, ...data.Results] : data.Results);
        setHasMore(data.Results.length === fetchPayload.PageSize);
        if (!isLoadMore && data.Results.length === 0) {
          setError('No jobs found matching your criteria.');
        }
      } else {
        console.error("Invalid response structure:", data);
        setHasMore(false);
        if (!isLoadMore) setJobs([]);
        setError('Received an invalid response.');
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError('Failed to fetch jobs.');
      if (!isLoadMore) setJobs([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [loading]); // Only depends on loading to prevent race conditions

  // Effect for initial load & filter changes
  useEffect(() => {
    // Stringify only the filter parts for comparison
    const currentFilterKey = JSON.stringify({
      Sector: payload.Sector,
      MinSalary: payload.MinSalary,
      MaxSalary: payload.MaxSalary
    });
    const activeFilterKey = JSON.stringify(activeFilters);

    if (isInitialLoad || currentFilterKey !== activeFilterKey) {
      console.log('Initial load or filters changed. Fetching page 1.');
      setActiveFilters({ // Update the active filters state
        Sector: payload.Sector,
        MinSalary: payload.MinSalary,
        MaxSalary: payload.MaxSalary
      });
      setJobs([]); // Clear current jobs
      setHasMore(true); // Assume there are more
      setIsInitialLoad(true); // Show skeleton on filter change
      fetchJobs({ ...payload, PageNumber: 1 }, false); // Fetch page 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.Sector, payload.MinSalary, payload.MaxSalary, fetchJobs]); // Trigger on filter changes

  // Effect for infinite scroll
  useEffect(() => {
    if (inView && !loading && hasMore && !isInitialLoad) {
      console.log('Infinite scroll: Loading next page.');
      const nextPage = payload.PageNumber + 1;
      // Update payload first to reflect the new page number for subsequent triggers
      setPayload(prev => ({ ...prev, PageNumber: nextPage }));
      // Call fetch with the next page payload
      fetchJobs({ ...payload, PageNumber: nextPage }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loading, hasMore, isInitialLoad]); // Don't include payload or fetchJobs here

  // --- Filter Handlers ---
  const handleSectorChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    // Update payload, triggering the filter useEffect
    setPayload(prev => ({ ...prev, Sector: selectedValues, PageNumber: 1 }));
  };

  const handleSalaryChange = (selectedValue) => {
    const selectedOption = salaryOptions.find(opt => opt.value === selectedValue);
    if (!selectedOption) return;
    setSelectedSalaryValue(selectedValue);
    // Update payload, triggering the filter useEffect
    setPayload(prev => ({ ...prev, MinSalary: selectedOption.min, MaxSalary: selectedOption.max, PageNumber: 1 }));
  };

  const handleResetFilters = () => {
    setSelectedSalaryValue('all');
    // Update payload, triggering the filter useEffect
    setPayload(initialPayload);
  };

  // --- Render Functions ---
  const renderLoadingSkeleton = (count = 6) => ( // Default to 6 skeletons
    <div className="row g-4">
      {[...Array(count)].map((_, index) => (
        <div className="col-sm-6 col-lg-4" key={`skel-${index}`}> {/* Adjusted grid */}
          <div className="card h-100 border-0 shadow-sm placeholder-glow" aria-hidden="true">
            <div className="card-body d-flex flex-column">
              <span className="placeholder placeholder-lg col-9 mb-2"></span>
              <span className="placeholder placeholder-sm col-7 mb-3"></span>
              <span className="placeholder col-12 mb-1"></span>
              <span className="placeholder col-10 mb-1"></span>
              <span className="placeholder col-11 mb-1"></span>
              <div className="mt-auto d-flex justify-content-end pt-2">
                <span className="placeholder placeholder-sm col-5"></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // --- Main Component Return ---
  return (
    <>
      <Header />
      <div className="container-fluid mt-4 px-lg-4">
        {/* Title */}
        <div className="text-center mb-4 mb-lg-5">
          <h1 className="display-5 fw-bold text-primary d-inline-flex align-items-center">
            <BsRocketTakeoffFill className="me-3" /> {/* react-icon */}
            Explore Jobs
          </h1>
        </div>

        <div className="row gx-lg-5"> {/* Add gutter spacing between columns */}

          {/* Filters Sidebar */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            {/* Make sidebar sticky */}
            <div className="filter-sidebar sticky-lg-top bg-white p-3 p-lg-4 rounded shadow-sm">
              <h4 className="fw-semibold mb-3 d-flex align-items-center">
                <BsFilterLeft className="me-2" /> Filters
              </h4>

              {/* Sector Filter */}
              <div className='mb-4'>
                <label htmlFor="sector-select" className="form-label fw-medium">Sector</label>
                <Select
                  inputId="sector-select"
                  isMulti
                  options={sectorsOptions}
                  value={sectorsOptions.filter(option => payload.Sector.includes(option.value))}
                  onChange={handleSectorChange}
                  classNamePrefix="select" // Important for CSS targeting
                  placeholder="Select sectors..."
                  aria-label="Select job sectors"
                />
              </div>

              {/* Salary Filter */}
              <div className='mb-4'>
                <label className="form-label fw-medium mb-2">Salary Range (Monthly)</label>
                {/* Use button group for a modern look */}
                <div className="d-grid gap-2">
                  {salaryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`btn btn-sm d-flex align-items-center justify-content-center ${selectedSalaryValue === option.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleSalaryChange(option.value)}
                      aria-pressed={selectedSalaryValue === option.value}
                    >
                      <span className="me-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="d-grid"> {/* Make button full width */}
                <button
                  className="btn btn-outline-danger"
                  onClick={handleResetFilters}
                  disabled={loading} // Disable while loading
                >
                  <BsArrowRepeat className="me-2" /> Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Jobs List Area */}
          <div className="col-lg-9">
            {/* Show Skeleton on initial load */}
            {isInitialLoad && loading && renderLoadingSkeleton(6)}

            {/* Show error message if not initial loading */}
            {!isInitialLoad && error && (
              <div className="alert alert-warning text-center">{error}</div>
            )}

            {/* Show job list if not initial load and no error (or jobs exist) */}
            {!isInitialLoad && !error && (
              <>
                {jobs.length === 0 ? (
                  <div className="alert alert-info text-center">No jobs found matching your criteria. Try adjusting the filters.</div>
                ) : (
                  <div className="row g-4">
                    {jobs.map((job) => (
                      <div className="col-md-6" key={job.Id}>
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
                      </div>
                    ))}
                  </div>
                )}

                {/* Infinite Scroll Trigger & Spinner */}
                <div ref={ref} className="text-center py-5" style={{ minHeight: '100px' }}>
                  {loading && hasMore && ( // Show spinner only when loading more
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading more jobs...</span>
                    </div>
                  )}
                  {!hasMore && jobs.length > 0 && (
                    <p className="text-muted fst-italic">You've seen all jobs for these filters.</p>
                  )}
                </div>
              </>
            )}
          </div> {/* End Jobs List Area col */}
        </div> {/* End Row */}
      </div> {/* End Container */}
    </>
  );
};

export default Jobs;
























// import React, { useEffect, useState, useCallback } from 'react';
// import Select from 'react-select';
// import { postJobData } from '../../Api/api';
// import { Link } from 'react-router-dom';
// import { useInView } from 'react-intersection-observer';
// import './index.css';
// import Header from '../Header';

// const sectorsList = [
//   "Agriculture", "Apparel, Madeups & Home Furnishing", "Automotive",
//   "Banking, Financial Services & Insurance (BFSI)", "Beauty & Wellness",
//   "Capital Goods", "Chemical & PetroChemical", "Construction",
//   "Domestic Workers", "Education", "Electronics", "Food Processing",
//   "Gem & Jewellery", "Healthcare", "Hydrocarbon", "Indian Iron & Steel",
//   "Indian Plumbing", "Infrastructure Equipment", "IT-ITeS",
//   "Life Sciences", "Logistics",
//   "Management & Entrepreneurship and Professional", "Media & Entertainment",
//   "Mining", "Other", "People with Disability", "Power",
//   "Production and Manufacturing", "Retailers Association's", "Rubber",
//   "Service", "Services including Repair and Maintenance", "Telecom"
// ];

// const sectorsOptions = sectorsList.map(sector => ({
//   label: sector,
//   value: sector
// }));

// const Jobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [hasMore, setHasMore] = useState(true);
//   const [salaryRange, setSalaryRange] = useState('all');
//   const [payload, setPayload] = useState({
//     PageNumber: 1,
//     PageSize: 10,
//     JobStatus: "Active",
//     Sector: [],
//     Country: [],
//     State: [],
//     SourceSystem: [],
//     MinSalary: 0,
//     MaxSalary: 100000000,
//     Field: "postedOn",
//     Order: "desc"
//   });

//   const { ref, inView } = useInView({
//     threshold: 0,
//     triggerOnce: false,
//   });

//   const fetchJobs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await postJobData(payload);
//       if (data?.Results?.length > 0) {
//         setJobs(prev => [...prev, ...data.Results]);
//         setHasMore(data.Results.length === payload.PageSize);
//         setError('');
//       } else {
//         setHasMore(false);
//         if (payload.PageNumber === 1) setError('No jobs found.');
//       }
//     } catch (err) {
//       setError('Failed to fetch jobs.');
//     }
//     setLoading(false);
//   }, [payload]);

//   useEffect(() => {
//     fetchJobs();
//   }, [fetchJobs]);

//   useEffect(() => {
//     if (inView && !loading && hasMore) {
//       setPayload(prev => ({ ...prev, PageNumber: prev.PageNumber + 1 }));
//     }
//   }, [inView, loading, hasMore]);

//   const handleSectorChange = (selectedOptions) => {
//     const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
//     setPayload(prev => ({
//       ...prev,
//       Sector: selectedValues,
//       PageNumber: 1
//     }));
//     setJobs([]);
//     setHasMore(true);
//   };

//   const handleSalaryChange = (e) => {
//     const value = e.target.value;
//     setSalaryRange(value);
//     let min = 0, max = 100000000;

//     if (value === 'unpaid') [min, max] = [0, 0];
//     else if (value === 'upto15k') [min, max] = [1, 15000];
//     else if (value === 'above15k') [min, max] = [15000, 100000000];

//     setPayload(prev => ({
//       ...prev,
//       MinSalary: min,
//       MaxSalary: max,
//       PageNumber: 1
//     }));
//     setJobs([]);
//     setHasMore(true);
//   };

//   const handleResetFilters = () => {
//     setPayload({
//       PageNumber: 1,
//       PageSize: 10,
//       JobStatus: "Active",
//       Sector: [],
//       Country: [],
//       State: [],
//       SourceSystem: [],
//       MinSalary: 0,
//       MaxSalary: 100000000,
//       Field: "postedOn",
//       Order: "desc"
//     });
//     setJobs([]);
//     setHasMore(true);
//     setSalaryRange('all');
//   }

//   return (
//     <>
//       <Header />
//       <div className="container py-5">
//         <h1 className="text-center mb-4 fw-bold text-gradient">🚀 Explore Jobs</h1>

//         <div className="row">
//           {/* Filters Sidebar */}
//           <div className="col-md-4 col-lg-3 mb-4">
//             <div className="card shadow-sm p-3 sticky-top" style={{ top: '80px' }}>
//               <h5 className="fw-semibold mb-3">🔍 Filters</h5>

//               <label className="form-label">Sector</label>
//               <Select
//                 isMulti
//                 options={sectorsOptions}
//                 value={sectorsOptions.filter(option => payload.Sector.includes(option.value))}
//                 onChange={handleSectorChange}
//                 classNamePrefix="select"
//                 placeholder="Select sectors..."
//               />

//               <label className="form-label mt-3">Salary Range</label>
//               <div className="d-flex flex-column  gap-2">
//                 {["unpaid", "upto15k", "above15k"].map((value) => (
//                   <div className="form-check" key={value}>
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="salary"
//                       value={value}
//                       id={`salary${value}`}
//                       checked={salaryRange === value}
//                       onChange={handleSalaryChange}
//                     />
//                     <label className="form-check-label" htmlFor={`salary${value}`}>
//                       {value === 'unpaid' && '💸 Unpaid / ₹0'}
//                       {value === 'upto15k' && '💵 ₹1 – ₹15,000'}
//                       {value === 'above15k' && '🤑 ₹15,000+'}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               <button
//     className="btn btn-outline-secondary mt-3"
//     onClick={handleResetFilters}
//   >
//     🔄 Reset Filters
//   </button>
//             </div>
//           </div>

//           {/* Jobs List */}
//           <div className="col-md-8 col-lg-9">
//             {jobs.length === 0 && loading ? (
//               <div className="text-center my-5">
//                 <div className="spinner-border text-primary me-2" role="status" />
//                 <span>Loading jobs...</span>
//               </div>
//             ) : error ? (
//               <div className="alert alert-warning text-center">{error}</div>
//             ) : (
//               <div className="row g-4">
//                 {jobs.map((job) => (
//                   <div className="col-md-6" key={job.Id}>
//                     <Link to={`/job/${job.Id}`} className="text-decoration-none text-dark">
//                       <div className="card h-100 border-0 shadow-sm job-card hover-shadow">
//                         <div className="card-body d-flex flex-column">
//                           <h5 className="card-title fw-bold text-primary">{job.JobTitle}</h5>
//                           <h6 className="card-subtitle mb-2 text-muted">{job.CompanyName || 'N/A'}</h6>
//                           <ul className="list-unstyled small">
//                             <li><strong>📍 Location:</strong> {job.JobLocationDistrict || 'N/A'}, {job.JobLocationState || 'N/A'}</li>
//                             <li><strong>💰 Salary:</strong> {job.MinCtcMonthly === 0 ? 'Unpaid' : `₹${job.MinCtcMonthly?.toLocaleString()}`}</li>
//                             <li><strong>🧑‍💼 Experience:</strong> {job.MinExperience || 0}+ yrs</li>
//                             <li><strong>🎓 Qualification:</strong> {job.MinEduQual || 'Not specified'}</li>
//                             <li><strong>📦 Vacancies:</strong> {job.VacancyCount || 1}</li>
//                           </ul>
//                           <div className="mt-auto text-end">
//                             <small className="text-muted">🕒  {new Date(job.PostedOn).toLocaleDateString('en-IN', {
//                               year: 'numeric',
//                               month: 'short',
//                               day: 'numeric',
//                             })}</small>
//                           </div>
//                         </div>
//                       </div>
//                     </Link>
//                   </div>
//                 ))}
//                 {hasMore && (
//                   <div ref={ref} className="text-center py-4">
//                     <div className="spinner-border text-primary" role="status" />
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Jobs;
