const { Pool  } = require('pg');
require('dotenv').config();

const pool  = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false, 
  },
});

pool.on('connect', () => {
  console.log('Connected to the database');
});


  
module.exports = pool ;
