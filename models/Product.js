// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  owner: {   // seller
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
