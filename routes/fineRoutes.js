// routes/fineRoutes.js
const express = require("express");
const router = express.Router();
const Fine = require("../models/Fine");
const User = require("../models/user");

// Middleware to identify FineMaster
function isFineMaster(req, res, next) {
  if (req.user.role === "FineMaster") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
}

// Add fine (FineMaster only)
router.post("/add-fine", isFineMaster, async (req, res) => {
  const { userId } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalFineToday = await Fine.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const currentFine = totalFineToday[0]?.total || 0;

  if (currentFine >= 100) {
    return res.status(400).json({ message: "Fine limit reached for today" });
  }

  const remaining = 100 - currentFine;
  const fineAmount = Math.min(10, remaining);

  const fine = new Fine({ user: userId, amount: fineAmount });
  await fine.save();

  res.json({ message: `Fine of ₹${fineAmount} added` });
});

// Get all fines
router.get("/fines", async (req, res) => {
  const fines = await Fine.find().populate("user", "username");
  res.json(fines);
});

// Get statistics per user
router.get("/stats", async (req, res) => {
  const stats = await Fine.aggregate([
    {
      $group: {
        _id: "$user",
        totalFine: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $project: {
        username: "$userDetails.username",
        totalFine: 1,
      },
    },
  ]);

  res.json(stats);
});

module.exports = router;
