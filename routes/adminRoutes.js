const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');

// -------------------- Constants --------------------
const MAX_ATTEMPTS = 3;
const BASE_TIMEOUT = 30 * 1000; // 30 seconds

// -------------------- Admin Login Page --------------------
router.get('/login', (req, res) => res.render('admin-login'));

// -------------------- Admin Login Handler --------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.send(`<script>alert('Admin not found'); window.location.href='/admin/login';</script>`);
  }

  // Initialize if undefined
  admin.loginAttempts = admin.loginAttempts || 0;
  admin.lockUntil = admin.lockUntil || null;

  // Check for lock
  if (admin.lockUntil && admin.lockUntil > Date.now()) {
    const waitTime = Math.ceil((admin.lockUntil - Date.now()) / 1000);
    return res.send(`<script>alert('Too many attempts. Try again in ${waitTime}s'); window.location.href='/admin/login';</script>`);
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    admin.loginAttempts += 1;

    if (admin.loginAttempts >= MAX_ATTEMPTS) {
      const lockDuration = BASE_TIMEOUT * Math.pow(2, admin.loginAttempts - MAX_ATTEMPTS);
      admin.lockUntil = new Date(Date.now() + lockDuration);
      await admin.save();
      return res.send(`<script>alert('Account locked. Try again after ${Math.ceil(lockDuration/1000)}s'); window.location.href='/admin/login';</script>`);
    } else {
      await admin.save();
      return res.send(`<script>alert('Incorrect password. Attempt ${admin.loginAttempts}/${MAX_ATTEMPTS}'); window.location.href='/admin/login';</script>`);
    }
  }

  // Successful login, reset counters
  admin.loginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  req.session.adminId = admin._id;   // ✅ keep adminId in session
  res.redirect('/admin/dashboard');
});

// -------------------- Admin Dashboard --------------------
router.get('/dashboard', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  const products = await Product.find().sort({ category: 1, title: 1 });
  res.render('admin-dashboard', { products });
});

// -------------------- Add Product --------------------
router.get('/add-product', (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  res.render('add-edit-product', { product: null });
});

router.post('/add-product', upload.single('img'), async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');  // ✅ safety check

  const { title, price, category, stock } = req.body;
  const img = req.file ? 'images/' + req.file.filename : '';

  try {
    await Product.create({
      title,
      price,
      category,
      stock,
      img,
      owner: req.session.adminId   // ✅ assign owner = logged-in admin
    });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).send("Failed to add product");
  }
});

// -------------------- Edit Product --------------------
router.get('/edit/:id', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');
  res.render('add-edit-product', { product });
});

router.post('/edit/:id', upload.single('img'), async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');

  const { title, price, category, stock, oldImg } = req.body;
  const img = req.file ? 'images/' + req.file.filename : oldImg;

  try {
    await Product.findByIdAndUpdate(req.params.id, {
      title,
      price,
      category,
      stock,
      img,
      owner: req.session.adminId  // ✅ keep/update owner as admin
    });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).send("Failed to update product");
  }
});

// -------------------- Delete Product --------------------
router.post('/delete/:id', async (req, res) => {
  if (!req.session.adminId) return res.redirect('/admin/login');
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

// -------------------- Logout --------------------
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

module.exports = router;
