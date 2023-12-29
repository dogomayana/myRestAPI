const jwt = require("jsonwebtoken");

const jwtTokens = ({ act_number }) => {
  const customer = { act_number };
  return jwt.sign(customer, process.env.BANK_SECRET, {
    expiresIn: "30m",
  });
  // return { accessToken };
};

module.exports = { jwtTokens };
