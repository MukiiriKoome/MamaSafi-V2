require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- Core middleware ---
app.use(express.json());

// --- DB connection ---
connectDB();

// --- Routes ---
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Mama Safi API is running" });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Centralized error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
