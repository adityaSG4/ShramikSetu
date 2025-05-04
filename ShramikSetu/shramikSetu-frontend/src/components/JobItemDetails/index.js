import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJob } from '../../Api/api';
import Header from '../Header';

const JobItemDetails = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetail = async () => {
      setLoading(true);
      try {
        const res = await fetchJob(id);
        if (res && res.data) {
          setJob(res.data);
        } else {
          setError('Failed to fetch job details.');
        }
      } catch {
        setError('An error occurred while fetching the job.');
      }
      setLoading(false);
    };

    fetchJobDetail();
  }, [id]);

  return (
    <>
      <Header />
      <div className="container py-5">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary me-2" role="status" />
            <span className="fs-5">Loading job details...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : job ? (
          <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '960px' }}>
            <div className="card-body p-4">
              <button
                onClick={() => navigate('/job')}
                className="btn btn-outline-secondary mb-4"
              >
                ← Back to Jobs
              </button>

              <div className="mb-4">
                <h2 className="fw-bold text-primary">{job.JobTitle}</h2>
                <p className="text-muted fs-5">{job.CompanyName || 'Unknown Company'}</p>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <p><strong>📍 Location:</strong><br /> {job.JobLocation?.District || 'N/A'}, {job.JobLocation?.State || 'N/A'}</p>
                  <p><strong>🎓 Qualification:</strong><br /> {job.MinEduQual || 'Not specified'}</p>
                  <p><strong>🧑‍💼 Experience Required:</strong><br /> {job.MinExperience || 0}+ years</p>
                  <p><strong>👥 Vacancy Count:</strong><br /> {job.VacancyCount || 'Not specified'}</p>
                </div>

                <div className="col-md-6">
                  <p><strong>💰 Salary (Monthly):</strong><br /> ₹{job.MinCtcMonthly?.toLocaleString() || '0'} - ₹{job.MaxCtcMonthly?.toLocaleString() || '0'}</p>
                  <p><strong>🗓️ Job Type:</strong><br /> {job.JobType || 'Full-time'}</p>
                  <p><strong>📅 Immediate Joiners:</strong><br /> {job.JoiningPriority || 'No preference'}</p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="mb-4">
                <h5 className="fw-bold">📝 Job Description</h5>
                <p>{job.JobDescription || 'No description provided.'}</p>
              </div>
              {job.Facilities && (
                <div className="mb-4">
                  <h5 className="fw-bold">🧳 Facilities & Benefits</h5>
                  {job.Facilities.SharedAccommodation && (
                    <p><strong>Shared Accommodation:</strong> {job.Facilities.SharedAccommodation}</p>
                  )}
                  {job.Facilities.Overtime && (
                    <p><strong>Overtime:</strong> {job.Facilities.Overtime}</p>
                  )}
                  {job.Facilities.WeeklyOff && (
                    <p><strong>Weekly Off:</strong> {job.Facilities.WeeklyOff}</p>
                  )}
                  {job.Facilities.SafetyGear && (
                    <p><strong>Safety Gear:</strong> {job.Facilities.SafetyGear}</p>
                  )}
                  {job.Facilities.JobStability && (
                    <p><strong>Stability:</strong> {job.Facilities.JobStability}</p>
                  )}
                </div>
              )}

              {(job.ContactPersonName || job.ContactPersonMobile || job.ContactPersonEmail) && (
                <div className="mb-4">
                  <h5 className="fw-bold">📞 Contact</h5>
                  {job.ContactPersonName && (
                    <p><strong>Name:</strong> {job.ContactPersonName}</p>
                  )}
                  {job.ContactPersonMobile && (
                    <p><strong>Phone:</strong> {job.ContactPersonMobile}</p>
                  )}
                  {job.ContactPersonEmail && (
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${job.ContactPersonEmail}`}>{job.ContactPersonEmail}</a>
                    </p>
                  )}
                </div>
              )}


              {job.ApplyUrl && (
                <a
                  href={job.ApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg btn-success fw-semibold"
                >
                  🚀 Apply Now
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center">No job found.</p>
        )}
      </div>
    </>
  );
};

export default JobItemDetails;
