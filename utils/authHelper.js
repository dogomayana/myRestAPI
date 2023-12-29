const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  const user = { id, role };
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return { token };
};

module.exports = generateToken;
