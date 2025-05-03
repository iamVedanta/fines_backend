// server.js
const express = require("express");
const mongoose = require("mongoose");
const fineRoutes = require("./routes/fineRoutes");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");
dotenv.config();

MONGO_URI = process.env.MONGO_URI;
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing form data

app.use("/api/auth", authRoutes);
app.use(express.json());
app.use((req, res, next) => {
  // mock authentication (in real app, use JWT or sessions)
  req.user = { username: "FineMaster", role: "FineMaster" }; // change dynamically in frontend
  next();
});

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api", fineRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
