// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Sign up
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  const existing = await User.findOne({ username });
  if (existing)
    return res.status(400).json({ message: "Username already exists" });

  // Set role based on username
  let role = "User";
  if (username === "rohanlobo") {
    role = "FineMaster";
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    res.json({
      message: "Account created successfully",
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // In production, send JWT here. For simplicity, return user info
    res.json({ username: user.username, role: user.role, id: user._id });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
