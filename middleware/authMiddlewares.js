const jwt = require("jsonwebtoken");
const db = require("../service/dbConnection");
const asyncHandler = require("express-async-handler");

// All users
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const token = authHeader && authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
      if (error) return res.status(403).json({ error: error.message });
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(404).json({ message: "Unauthorized User" });
  }
};

// Admin role
const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized A" });
  }
  const token = authHeader && authHeader.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
      if (error) return res.status(403).json({ error: error.message });
      if (user.role !== "thomasstephen252@gmail.com") {
        return res.status(403).json({ message: "forbidden" });
      }
      req.user = {
        user: user.role == "thomasstephen252@gmail.com",
      };
      next();
    });
  } catch (error) {
    return res.status(404).json({ message: "Unauthorized" });
  }
};

const protectMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Null Token" });
  }
  try {
    const decode = jwt.verify(token, process.env.BANK_SECRET);
    const { rows } = await db.query(
      `SELECT act_number, customer_firstname, customer_lastname FROM customer_details WHERE act_number = $1`,
      [decode.act_number]
    );

    if (rows.lenght === 0) {
      return res.status(401).json({ message: "Invalid user" });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json(error.message);
    throw new Error("Invalid Token");
  }
});

module.exports = { authMiddleware, adminMiddleware, protectMiddleware };
