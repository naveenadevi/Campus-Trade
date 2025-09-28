const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { type: String, required: true },  // snapshot of product title
        price: { type: Number, required: true },  // snapshot of product price
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    userDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMode: {
      type: String,
      enum: ["Cash on Delivery", "UPI", "Card","Net Banking"], // ✅ allowed values
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true } // ✅ automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Order", orderSchema);
