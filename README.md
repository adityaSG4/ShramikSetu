

# ShramikSetu 💙

ShramikSetu is a full-stack web portal developed for the Smart AMI Hackathon 2025 by Team HackOps. It automates blue-collar job listings by fetching data from various sources and delivering personalized job recommendations for seekers. 

---

## 🔧 Features

### 👥 Authentication
- User registration and login
- JWT-based secure session handling

### 📦 Job Listings (Hackathon Focus)
- Automated job fetching from multiple sources via APIs
- Personalized job recommendations based on profile
- Sector and location-based filtering

### 👤 User Profiles
- Fill and update job-seeker profiles
- Fields: Name, DOB, Gender, Skills, Work Experience, Interests, etc.
- Profile picture and JSON-based recommendations storage


---

## 🖥️ Live Demo

🔗 [Frontend on Vercel](https://shramik-setu-main.vercel.app/)

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://www.npmjs.com/) 

## 🚀 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/adityaSg4/ShramikSetu.git
cd ShramikSetu

```
---
### 2. Set Up Your Database

Create a PostgreSQL database using cloud service [Neon](https://neon.tech).

---

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
-- create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create Profile table
CREATE TABLE profile (
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

```
---


## 📦 Install Dependencies

Run this in both the frontend and backend directories:

```bash
npm install
```


---

## 🏁 Run the App Locally

### Backend

```bash
cd ShramikSetu-backend
npm intsall
npm start
```

### Frontend

```bash
cd ShramikSetu-frontend
npm intsall
npm start
```

---

## 📂 Project Structure

```
ShramikSetu/
│
├── ShramikSetu-frontend/        # React.js frontend
├── ShramikSetu-backend/         # Node.js backend with Express and pg
```

---

## 🙌 Team HackOps

- **Aditya Gupta (me)**
- **Sarthak Gudhekar**
- **Onkar Kane**

---

## 📈 Future Scope

- Add regional language support
- Voice search & chatbot
- Real-time employer-worker chat
- Resume parsing and AI-based matching

---

## 🙌 Contributions

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

MIT © [AdityaSG4](https://github.com/AdityaSG4)
