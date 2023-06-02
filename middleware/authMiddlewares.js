const jwt = require("jsonwebtoken");

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

module.exports = { authMiddleware, adminMiddleware };
