const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');

console.log('userRoutes:', typeof userRoutes);
console.log('jobRoutes:', typeof jobRoutes);
console.log('profileRoutes:', typeof profileRoutes);


// Routes
app.use('/', jobRoutes);
app.use('/', userRoutes);
app.use('/profile', profileRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
