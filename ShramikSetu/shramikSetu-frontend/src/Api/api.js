import axios from "axios";


// Create an Axios instance pointing to the local backend
export const api = axios.create({
    baseURL: "http://localhost:5000", // Change baseURL to your local backend
  });


  
// Function for handling login
export const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      return res.data;  // returns the token and user data
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  


// Function for handling user registration
export const register = async (username, email, password) => {
  try {
    const res = await api.post('/register', { username, email, password });
    return res.data; // returns success message or user data after registration
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// To fetch the data using a GET request
export const fetchJob = async (Id) => {
  try {
    // Use the jobId to make a GET request for a specific job
    const res = await api.get(`/job/${Id}/`);
    return res.status === 200 ? res : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// To post the payload to the backend
export const postJobData = async (payload) => {
  try {
    // Make a POST request with the payload
    const res = await api.post("/job/", payload);
    return res.status === 200 ? res.data : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

