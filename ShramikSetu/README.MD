### 3. Configure Environment Variables

Create a `.env` file in the root of your backend directory and add the following:

```env
# .env.example — sample environment config

PGHOST='your_host_here'
PGDATABASE='your_database_name'
PGUSER='your_db_username'
PGPASSWORD='your_password'
PGPORT='5432'
JWT_SECRET='your_jwt_secret'
```

---
### 4. Open in Browser
#### 🗃️ Database Setup (Paste this in SQL Editor on Neon.tech)

```sql
-- CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT INTO users (username, email, password, role)
VALUES 
('admin', 'admin@example.com', '$2a$10$B2TgP26YpXDF7prouzke5O.X0i9HRBCDdr4gJP9C62D.dTP5G5zHG', 'user');



-- CREATE TABLE profile (
    user_id SERIAL PRIMARY KEY,
    fullName TEXT NOT NULL,
    dob TEXT, 
    gender TEXT,
    mobileNumber TEXT,
    city TEXT,
    highestQualification TEXT,
    occupation TEXT,
    workExperience TEXT,
    interests TEXT,
    profilePicture TEXT,
    recommendations JSONB
);


