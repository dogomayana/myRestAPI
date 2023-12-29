const express = require("express");
const {
  getAllCustomersDetails,
  getCustomerDetails,
  withdraw,
  createTableQuery,
  deposit,
  createCustomer,
} = require("../controllers/bankingController");
const { register, logIn } = require("../controllers/bankAuthController");
const { protectMiddleware } = require("../middleware/authMiddlewares");
const router = express.Router();

router.put("/createCustomer", createCustomer);
router.get(
  "/getAllCustomersDetails",
  protectMiddleware,
  getAllCustomersDetails
);
router.get("/getCustomerDetails", getCustomerDetails);
router.put("/withdrawal", withdraw);
router.put("/deposit", deposit);
router.put("/register", register);
router.get("/login", logIn);

module.exports = router;
