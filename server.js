// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------- MongoDB Connection ----------------
console.log("Connecting to MongoDB:", process.env.MONGODBURL);

// Correct for Mongoose v7+
mongoose
  .connect(process.env.MONGODBURL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------- Product Schema & Model ----------------
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  description: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// ---------------- Products API ----------------

// GET all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET single product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// CREATE product
app.post("/products", async (req, res) => {
  try {
    const { title, price, img, description, category } = req.body;
    if (!title || !price || !img)
      return res.status(400).json({ msg: "Title, price, and img required" });

    const product = await Product.create({
      title,
      price,
      img,
      description,
      category,
    });

    res.status(201).json({ msg: "Product created", product });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// UPDATE product by ID
app.put("/products/:id", async (req, res) => {
  try {
    const { title, price, img, description, category } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { title, price, img, description, category },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product updated", updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ---------------- Initialize Sample Products ----------------
async function initializeProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.create([
      {
        title: "Premium Bag",
        price: 2000,
        img: "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696461/samples/ecommerce/leather-bag-gray.jpg",
        description: "High-quality leather bag",
        category: "Bags",
      },
      {
        title: "Luxury Chair",
        price: 10000,
        img: "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696469/samples/chair-and-coffee-table.jpg",
        description: "Comfortable modern chair",
        category: "Furniture",
      },
      {
        title: "Analog Watch",
        price: 30000,
        img: "https://res.cloudinary.com/dhdepk5ib/image/upload/v1757696459/samples/ecommerce/analog-classic.jpg",
        description: "Classic wristwatch",
        category: "Watches",
      },
    ]);
    console.log("✅ Sample products added");
  }
}

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
