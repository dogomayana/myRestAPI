const express = require("express");
const router = express.Router();
const {
  signUp,
  logIn,
  getAllUsers,
  deleteAllUsers,
  searchUser,
} = require("../controllers/authController.js");

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.get("/getUsers", getAllUsers);
router.get("/searchUser", searchUser);
router.delete("/deleteAllUsers", deleteAllUsers);

module.exports = router;
