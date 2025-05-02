// models/Fine.js
const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Fine", fineSchema);
