# CampusTrade 

CampusTrade is a **full-stack web application** that provides a simple marketplace platform for students and staff inside a campus. Users can buy, sell, and manage products, while admins oversee all listings and orders. The project is built using the mongodb,express.js,node.js with server-side rendering via **EJS** templates and styled with **TailwindCSS**.

---

##  Features

###  Users

* Register and log in with secure password hashing
* Browse products by category or search
* Add products to cart and adjust quantities
* Place orders and view past purchases

###  Sellers

* List new products with title, description, price, category, and image
* Manage existing product listings

###  Admins


* View all users and manage their accounts
* Monitor orders and marketplace activity

---

##  Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB 
* **Frontend**: EJS templates, TailwindCSS, vanilla JS
* **Authentication**: Express-session with MongoDB store, bcryptjs for hashing
  

---

## Project Structure

```
Ctrade/
 ├── models/          # Mongoose schemas (User, Admin, Product, Order)
 ├── routes/          # Express route handlers (user, admin, product, cart, orders)
 ├── views/           # EJS templates for pages
 ├── public/          # Static assets (CSS, JS, images)
 ├── db.js            # Database connection setup
 ├── server.js        # Main application entry point
 ├── seed.js          # Script to seed products from products.json
 ├── products.json    # Sample product data
 ├── package.json     # Project metadata and dependencies
 └── .env.example     # Example environment variables
```

---

##  Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/naveenadevi/Campus-Trade.git
cd Campus-Trade/Ctrade
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```
DB_URI=mongodb://localhost:27017/campustrade
SESSION_SECRET=your_secret_here
PORT=3000
```

### 4. Seed sample products (optional)

```bash
node seed.js
```

### 5. Run the app

```bash
npm start
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

