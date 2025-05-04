const axios = require('axios');
const pool = require('../config/db');

exports.getJobList = async (req, res) => {
  try {
    const {
      PageNumber = 1,
      PageSize = 10,
      JobStatus = "Active",
      Sector = [],
      Country = [],
      State = [],
      SourceSystem = [],
      MinSalary = 0,
      MaxSalary = 999999,
      Field = "postedOn",
      Order = "desc"
    } = req.body;


    // 🔹 External API using Axios
    const { data: skillIndiaData } = await axios.post(
      'https://api-fe.skillindiadigital.gov.in/api/jobs/filter',
      {
        PageNumber,
        PageSize,
        JobStatus,
        Sector,
        Country,
        State,
        SourceSystem,
        MinSalary,
        MaxSalary,
        Field,
        Order
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://www.skillindiadigital.gov.in',
          'Referer': 'https://www.skillindiadigital.gov.in/'
        }
      }
    );

    const skillIndiaJobs = skillIndiaData?.Data || [];

   
    res.json(skillIndiaJobs);
  } catch (err) {
    console.error('Error fetching job list:', err.message);
    res.status(500).json({ error: 'Failed to fetch combined job list' });
  }
};



exports.getJobDetails = async (req, res) => {
  const {Id} = req.params;
  if (!Id) {
    return res.status(400).json({ message: 'Job ID is required' });
  }
  try {
    const response = await axios.get(`https://api-fe.skillindiadigital.gov.in/api/jobs/${Id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.skillindiadigital.gov.in',
        'Referer': 'https://www.skillindiadigital.gov.in/',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const jobData = response.data?.Data;

    if (!jobData) {
      return res.status(404).json({ message: 'Job not found in Skill India API' });
    }

    res.status(200).json(jobData);
  } catch (err) {
    console.error('❌ Error fetching from Skill India:', err.message);
    res.status(500).json({ error: 'Failed to fetch job from Skill India API' });
  }
};
