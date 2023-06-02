const {
  addCourse,
  getAllCourse,
  addLesson,
  getCourse,
  deleteAllCourses,
} = require("../controllers/courseController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddlewares");
const express = require("express");

const router = express.Router();
router.post("/addCourse", adminMiddleware, addCourse);
router.post("/addLesson", adminMiddleware, addLesson);
router.get("/getAllCourses", getAllCourse);
router.get("/getCourse/:id", authMiddleware, getCourse);
router.delete("/deleteCourses", deleteAllCourses);
module.exports = router;
