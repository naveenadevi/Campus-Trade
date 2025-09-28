const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const generateInvoice = require('../utils/generateInvoice');
const path = require('path');

const router = express.Router();

// -------------------- Landing --------------------
router.get('/', (req, res) => {
  res.render('role');
});

// -------------------- Signup --------------------
router.get('/signup', (req, res) => res.render('signup'));

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.send(`<script>alert('Email and password are required'); window.location.href='/signup';</script>`);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send(`<script>alert('User already exists. Please login.'); window.location.href='/login';</script>`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });
  res.redirect('/login');
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.send(`<script>alert('You haven’t signed up yet. Please sign up first!'); window.location.href='/signup';</script>`);
  }
const MAX_ATTEMPTS = 3;
const BASE_TIMEOUT = 30 * 1000;
  // Initialize fields if undefined
  user.loginAttempts = user.loginAttempts || 0;
  user.lockUntil = user.lockUntil || null;

  // Check if user is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const waitTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
    return res.send(`<script>alert('Too many attempts. Try again in ${waitTime}s'); window.location.href='/login';</script>`);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_ATTEMPTS) {
      const lockDuration = BASE_TIMEOUT * Math.pow(2, user.loginAttempts - MAX_ATTEMPTS);
      user.lockUntil = new Date(Date.now() + lockDuration);
      await user.save();
      return res.send(`<script>alert('Account locked. Try again after ${Math.ceil(lockDuration/1000)}s'); window.location.href='/login';</script>`);
    } else {
      await user.save();
      return res.send(`<script>alert('Incorrect password. Attempt ${user.loginAttempts}/${MAX_ATTEMPTS}'); window.location.href='/login';</script>`);
    }
  }

  // Successful login, reset counters
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  req.session.userId = user._id;
  req.session.cart = [];
  res.redirect('/home');
});

// -------------------- Home --------------------
router.get('/home', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const searchQuery = req.query.search || '';
  const categoryFilter = req.query.category || '';
  const added = req.query.added === 'true';

  const filter = {};
  if (searchQuery) filter.title = new RegExp(searchQuery, 'i');
  if (categoryFilter) filter.category = categoryFilter;

  try {
    const user = await User.findById(req.session.userId);
    const products = await Product.find(filter).sort({ title: 1 });
    const categories = await Product.distinct("category");

    res.render('home', {
      products,
      categories,
      searchQuery,
      categoryFilter,
      userName: user.name,
      added
    });
  } catch (err) {
    console.error('Home route error:', err);
    res.status(500).send('Internal server error');
  }
});


// Add to Cart
router.post('/add-to-cart/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).send('Product not found');
  if (product.stock === 0) return res.send('Out of stock');

  const cart = req.session.cart || [];
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product._id.toString(),
      title: product.title,
      price: product.price,
      quantity: 1,
    });
  }

  req.session.cart = cart;
  res.redirect('/cart');
});

// Cart Page
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cart, totalAmount });
});

// Cart Actions
router.post('/cart/increase/:id', (req, res) => {
  const cart = req.session.cart || [];
  const item = cart.find(p => p.productId === req.params.id);
  if (item) item.quantity += 1;
  req.session.cart = cart;
  res.redirect('/cart');
});

router.post('/cart/decrease/:id', (req, res) => {
  const cart = req.session.cart || [];
  const item = cart.find(p => p.productId === req.params.id);
  if (item) item.quantity = Math.max(1, item.quantity - 1);
  req.session.cart = cart;
  res.redirect('/cart');
});

router.post('/cart/remove/:id', (req, res) => {
  let cart = req.session.cart || [];
  cart = cart.filter(item => item.productId !== req.params.id);
  req.session.cart = cart;
  res.redirect('/cart');
});

// Checkout Page
router.get('/checkout', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const cart = req.session.cart || [];
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('checkout', { cart, totalAmount });
});

// Place Order
// -------------------- Place Order --------------------
router.post('/place-order', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const cart = req.session.cart || [];
    if (!cart.length) return res.redirect('/cart');

    const { name, address, phone, paymentMode } = req.body;
    if (!name || !address || !phone || !paymentMode) {
      return res.status(400).send('Missing required fields');
    }

    // Build order items
    const orderItems = cart.map(item => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity
    }));

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    // Check stock availability first
for (const item of cart) {
  const product = await Product.findById(item.productId);
  if (!product) {
    return res.status(400).send(`Product ${item.title} not found`);
  }
  if (item.quantity > product.stock) {
    return res.send(`<script>alert('Sorry, only ${product.stock} units of "${product.title}" are available'); window.location.href='/cart';</script>`);
  }
}


    // Save new order
    const newOrder = new Order({
      userId: req.session.userId,
      items: orderItems,
      userDetails: { name, address, phone },
      paymentMode,
      totalAmount
    });

    await newOrder.save();

    // Decrease stock for each product
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Clear cart after order placed
    req.session.cart = [];

    // Redirect to orders page
    res.redirect('/orders');
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).send('Server Error');
  }
});

// Orders
router.get('/orders', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });
  res.render('orders', { orders });
});

// Invoice
router.get('/invoice/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
   const order = await Order.findById(orderId).populate('items.productId'); // ✅ Fix here
 if (!order) return res.status(404).send('Order not found');

    res.render('invoice', { order });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// Get buyers of a product
router.get("/products/:id/buyers", async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Find all orders where this product exists in items[]
    const orders = await Order.find({ "items.productId": productId })
      .populate("userId", "name email"); // only pull name, email from User

    res.render("buyers", { product, orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// -------------------- Thank You --------------------
router.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

// -------------------- Logout --------------------
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
