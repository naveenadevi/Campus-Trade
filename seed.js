const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const Product = require("./models/Product");

// ✅ MongoDB connection
require("./db");

async function seed() {
  try {
    // ✅ Ensure default admin
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

    // ✅ Clear old products (optional)
    await Product.deleteMany({});
    console.log("🗑️ Old products cleared.");

    // ✅ Products list
    const products = [
      {
        title: "Dell Inspiron Laptop",
        price: 25000,
        category: "Electronics",
        img: "images/laptop.png",
        stock: 2,
        owner: admin._id,
      },
      {
        title: "Engineering Mathematics Textbook",
        price: 500,
        category: "Books",
        img: "images/book.png",
        stock: 10,
        owner: admin._id,
      },
      {
        title: "Casio FX-991MS Calculator",
        price: 800,
        category: "Stationery",
        img: "images/image.png",
        stock: 5,
        owner: admin._id,
      },
      {
        title: "Cricket Bat",
        price: 1200,
        category: "Sports",
        img: "images/image copy 7.png",
        stock: 3,
        owner: admin._id,
      },
      {
        title: "Hostel Chair",
        price: 700,
        category: "Furniture",
        img: "images/image copy 6.png",
        stock: 4,
        owner: admin._id,
      },
      {
        title: "Samsung Galaxy Smartphone",
        price: 15000,
        category: "Electronics",
        img: "images/image copy 5.png",
        stock: 6,
        owner: admin._id,
      },
      {
        title: "College Backpack",
        price: 1200,
        category: "Accessories",
        img: "images/image copy 4.png",
        stock: 8,
        owner: admin._id,
      },
      {
        title: "Bluetooth Earphones",
        price: 999,
        category: "Electronics",
        img: "images/image copy 3.png",
        stock: 12,
        owner: admin._id,
      },
      {
        title: "Python Programming Book",
        price: 600,
        category: "Books",
        img: "images/image copy 2.png",
        stock: 7,
        owner: admin._id,
      },
      {
        title: "Wooden Study Table",
        price: 3500,
        category: "Furniture",
        img: "images/image copy.png",
        stock: 2,
        owner: admin._id,
      },
      // ✅ Your new products (from local /images folder)
      {
        title: "Apple Watch",
        price: 25000,
        category: "Electronics",
        img: "images/applewatch.jpg",
        stock: 3,
        owner: admin._id,
      },
      {
        title: "Boat Rockerz",
        price: 1500,
        category: "Electronics",
        img: "images/boatrockerz.jpg",
        stock: 10,
        owner: admin._id,
      },
      {
        title: "Bookshelf",
        price: 5000,
        category: "Furniture",
        img: "images/bookshelf.jpg",
        stock: 4,
        owner: admin._id,
      },
      {
        title: "Kurti",
        price: 800,
        category: "Clothing",
        img: "images/kurti.jpg",
        stock: 15,
        owner: admin._id,
      },
      {
        title: "Lego Set",
        price: 3000,
        category: "Toys",
        img: "images/lego.jpg",
        stock: 5,
        owner: admin._id,
      },
      {
        title: "Lenovo Ideapad",
        price: 45000,
        category: "Electronics",
        img: "images/lenovoideapad.jpg",
        stock: 6,
        owner: admin._id,
      },
      {
        title: "Men's Shirt",
        price: 1200,
        category: "Clothing",
        img: "images/mensshirt.jpg",
        stock: 20,
        owner: admin._id,
      },
      {
        title: "Office Chair",
        price: 3000,
        category: "Furniture",
        img: "images/offchair.jpg",
        stock: 5,
        owner: admin._id,
      },
      {
        title: "Remote Car",
        price: 1500,
        category: "Toys",
        img: "images/remotecar.jpg",
        stock: 8,
        owner: admin._id,
      },
      {
        title: "Samsung S20 FE",
        price: 30000,
        category: "Electronics",
        img: "images/samsung20fe.jpg",
        stock: 7,
        owner: admin._id,
      },
      {
        title: "Sneakers",
        price: 2500,
        category: "Footwear",
        img: "images/sneakers.jpg",
        stock: 12,
        owner: admin._id,
      },
      {
        title: "Teddy Bear",
        price: 1000,
        category: "Toys",
        img: "images/teddy.jpg",
        stock: 9,
        owner: admin._id,
      },
    ];

    // ✅ Insert products
    await Product.insertMany(products);
    console.log("✅ Products seeded successfully!");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
}

seed();
