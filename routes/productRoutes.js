const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isUserLoggedIn } = require("../middleware/auth");
const Order = require('../models/Order');   // 👈 add this line


// 📌 Home - Show ALL products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('home', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading products");
  }
});

// 📌 My Products - Show ONLY logged-in user's products
// 📌 My Products - Show ONLY logged-in user's products + buyers
router.get("/my-products", isUserLoggedIn, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.session.userId });

    // attach buyers for each product
    const productsWithBuyers = await Promise.all(
      products.map(async (product) => {
        const orders = await Order.find({ "items.productId": product._id })
                                  .populate("userId", "name email"); // get buyer info
        return {
          ...product.toObject(),
          buyers: orders.map(order => order.userId)
        };
      })
    );

    res.render("my-products", { products: productsWithBuyers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading your products");
  }
});


// 📌 Add Product Form
router.get("/addProduct", isUserLoggedIn, (req, res) => {
  res.render("products/addProduct");
});

// 📌 Handle Add Product
router.post("/addProduct", isUserLoggedIn, async (req, res) => {
  try {
    const { title, price, category, img, stock } = req.body;

    await Product.create({
      title,
      price,
      category,
      img,
      stock,
      owner: req.session.userId, // 👈 ensure ownership
    });

    res.redirect("/my-products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
});

// 📌 Edit Product Form (restrict to owner only)
router.get("/edit/:id", isUserLoggedIn, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.session.userId, // 👈 only logged-in user's product
    });
    if (!product) return res.status(404).send("Product not found or not yours");
    res.render("products/editProduct", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit form");
  }
});

// 📌 Handle Edit Product
router.post("/edit/:id", isUserLoggedIn, async (req, res) => {
  try {
    const { title, price, category, img, stock } = req.body;
    await Product.updateOne(
      { _id: req.params.id, owner: req.session.userId }, // 👈 restrict to owner
      { title, price, category, img, stock }
    );
    res.redirect("/my-products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
});

// 📌 Delete Product (restrict to owner only)
router.post("/delete/:id", isUserLoggedIn, async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id, owner: req.session.userId });
    res.redirect("/my-products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
