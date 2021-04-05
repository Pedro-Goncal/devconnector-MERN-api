const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

//DOTENV
const dotenv = require("dotenv");
dotenv.config();

//Initialize Express
const app = express();

//Connect To Mongo DB
connectDB();

//ROUTES
const authRoutes = require("./routes/api/authRoutes");
const postsRoutes = require("./routes/api/postsRoutes");
const profileRoutes = require("./routes/api/profileRoutes");
const usersRoutes = require("./routes/api/usersRoutes");

//PORT
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS, DELETE, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);

  next();
});

//Initialize cors
app.use(cors());

app.use(express.json());

//===================
//APIs
//===================

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () =>
  console.log(`==>listening on http://localhost:${PORT}<==`)
);
