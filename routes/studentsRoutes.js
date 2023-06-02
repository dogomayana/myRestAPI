const {
  getAllStudents,
  addStudent,
  createAnswers,
  updateStudentPoint,
  updatePaid,
  getStudent,
  // searchStudent,
} = require("../controllers/studentsController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddlewares");
const express = require("express");
const router = express.Router();

router.get("/getAllStudents", authMiddleware, getAllStudents);
// router.get("/searchStudent", searchStudent);
router.get("/getAllStudents/:phoneNum", authMiddleware, getStudent);
router.post("/addStudent", authMiddleware, addStudent);
router.put("/answeredExercise", authMiddleware, createAnswers);
router.put(
  "/updateStudentPoint/:phoneNum/points",
  adminMiddleware,
  updateStudentPoint
);
router.put("/updatePaid/:phoneNum/paid", adminMiddleware, updatePaid);

module.exports = router;
