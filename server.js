const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect to MongoDB
require('./db');

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// ✅ View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Sessions
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/ecommerce",
      ttl: 24 * 60 * 60, // 1 day
    }),
  })
);

// ✅ Ensure single default admin
async function ensureAdmin() {
  try {
    const email = "navee123@example.com";
    const password = "navee123";

    let admin = await Admin.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await Admin.create({ email, password: hashedPassword });
      console.log(`✅ Default admin created: ${email} / ${password}`);
    } else {
      console.log("✅ Admin already exists.");
    }
  } catch (err) {
    console.error("❌ Error ensuring admin:", err);
  }
}
ensureAdmin();

// ✅ Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', productRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
