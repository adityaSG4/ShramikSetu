import React from 'react'

const FiltersGroup = () => {
  return (
    <div>
      <h1>Filters Group</h1>
      <p>Filters for job search will be displayed here.</p>
      <div className="filters">
        <div className="filter-item">
          <label htmlFor="location">Location</label>
          <input type="text" id="location" />
        </div>
        <div className="filter-item">
          <label htmlFor="job-type">Job Type</label>
          <select id="job-type">
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="experience-level">Experience Level</label>
          <select id="experience-level">
            <option value="entry-level">Entry Level</option>
            <option value="mid-level">Mid Level</option>
            <option value="senior-level">Senior Level</option>
          </select>
        </div>
      </div>
      
    </div>
  )
}



export default FiltersGroup
