

# Agrofix App 🌱

Agrofix is a full-stack web platform to manage bulk vegetable/fruit orders for buyers and admins.

---

## 🔧 Features

### 👥 Authentication
- User registration and login
- JWT-based secure session handling

### 🛒 Buyer Functionality
- Browse product listings
- View product details
- Add products to cart
- Place bulk orders
- View order history

### 🧑‍💼 Admin Functionality
- Full **CRUD operations** for products
- View all placed orders
- view user
- Update user roles (e.g., promote user to admin)

---

## 🖥️ Live Demo

🔗 [Frontend on Vercel](https://agrofix-main.vercel.app/)

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://www.npmjs.com/) 

## 🚀 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/adityaSg4/agrofix.git
cd agrofix

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
-- create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category TEXT,
  name TEXT NOT NULL,
  price TEXT,
  image TEXT,
  description TEXT,
  quantity INT DEFAULT 0
);

-- add some products data
INSERT INTO products (category, name, price, image, description)
VALUES
('vegetable', 'Tomatoes', '₹20/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051590/Tomatoes_i8wtwl.jpg', 'Fresh red tomatoes, perfect for salads, cooking, and sauces.'),
('vegetable', 'Potatoes', '₹25/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051587/Potatoes_swyjzm.jpg', 'Versatile starchy potatoes, great for curries, fries, and more.'),
('fruit', 'Apples', '₹150/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051593/Apples_kfq8i8.jpg', 'Juicy red apples full of fiber and antioxidants.'),
('fruit', 'Bananas', '₹40/dozen', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051590/Bananas_mzzmot.jpg', 'Sweet ripe bananas, rich in potassium and energy.'),
('vegetable', 'Onions', '₹30/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051586/Onions_mi2i4p.jpg', 'Essential kitchen staple, adds flavor to all dishes.'),
('vegetable', 'Carrots', '₹45/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051588/Carrots_ey7p7p.jpg', 'Crunchy and sweet, great for snacking or cooking.'),
('fruit', 'Mangoes', '₹100/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051586/Mangoes_twpcr4.jpg', 'King of fruits, juicy and aromatic Alphonso mangoes.'),
('fruit', 'Oranges', '₹60/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051598/Oranges_drzlyv.jpg', 'Citrusy and refreshing, loaded with Vitamin C.'),
('vegetable', 'Cauliflower', '₹40/piece', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051585/Cauliflower_zxgulu.jpg', 'Firm and white, ideal for stir-fries and gravies.'),
('vegetable', 'Spinach', '₹20/bunch', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051587/Spinach_s4oayr.jpg', 'Leafy green superfood, rich in iron and fiber.'),
('fruit', 'Grapes', '₹80/kg', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051586/Grapes_heclhy.jpg', 'Sweet and seedless, great for snacking and desserts.'),
('fruit', 'Pineapple', '₹50/piece', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051587/Pineapple_ycpeef.jpg', 'Tropical delight with a tangy and juicy flavor.'),
('vegetable', 'Cabbage', '₹35/piece', 'https://res.cloudinary.com/dtbhfhox6/image/upload/v1745051585/Cabbage_flgomc.jpg', 'Crisp and healthy, great for salads and sabzis.');

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

-- insert admin [ Login Credentials for Testing ]

INSERT INTO users (username, email, password, role)
VALUES 
('admin', 'admin@example.com', '$2a$10$B2TgP26YpXDF7prouzke5O.X0i9HRBCDdr4gJP9C62D.dTP5G5zHG', 'admin');

-- create orders table 
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- create order_items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
```

---

## 🔒 Login Credentials for Testing

- **Admin Email**: `admin@example.com`
- **Password**: `Admin123`

> Note: Passwords are hashed using bcrypt, change hash in seed script for security if needed.

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
cd agrofix-backend
npm intsall
npm start
```

### Frontend

```bash
cd agrofix-frontend
npm intsall
npm start
```

---

## 📂 Project Structure

```
agrofix/
│
├── agrofix-frontend/        # React.js frontend
├── agrofix-backend/         # Node.js backend with Express and pg
```

---

## 🙌 Contributions

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

MIT © [AdityaSG4](https://github.com/AdityaSG4)