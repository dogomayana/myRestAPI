const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const Joi = require("joi");

//////To get all students
const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        answeredExercise: true,
      },
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving students" });
  }
});

//////To get a student
const getStudent = asyncHandler(async (req, res) => {
  const { phoneNum } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: {
        phoneNum,
      },
      include: {
        answeredExercise: true,
      },
    });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving students" });
  }
});

const searchStudent = asyncHandler(async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      res.status(401).json("Empty params");
    }

    const search = await prisma.student.findMany({
      where: {
        phoneNum: {
          contains: searchQuery,
        },
      },
      include: {
        answeredExercise: true,
      },
    });
    res.status(200).json(search);
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

//////To add a student
const addStudent = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    fName: Joi.string().required(),
    oName: Joi.string().required(),
    gender: Joi.string().required(),
    dob: Joi.string().required(),
    email: Joi.string().required(),
    phoneNum: Joi.string().required(),
    lName: Joi.string().required(),
  });

  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { fName, oName, gender, dob, email, phoneNum, lName } = value;

    let studentExits;
    if (email.includes("@")) {
      studentExits = await prisma.student.findUnique({
        where: { email },
      });
    } else {
      studentExits = await prisma.student.findUnique({
        where: { phone },
      });
    }

    if (studentExits) {
      return res.status(401).json({ error: "Student Exits" });
    }
    const student = await prisma.student.create({
      data: {
        fName,
        oName,
        gender,
        dob,
        email,
        phoneNum,
        lName,
      },
    });
    res.status(201).json({ message: "created successfull" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create new student" });
  }
});

///Add answers
const createAnswers = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    title: Joi.string().required(),
    phoneNum: Joi.string().required(),
    answer: Joi.string().required(),
  });
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { phoneNum, title, answer } = value;
  // const { exercises } = req.body;

  try {
    const student = await prisma.student.findUnique({
      where: {
        phoneNum: phoneNum,
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const answeredExercise = await prisma.answeredExercise.create({
      data: {
        title,
        answer,
        student: { connect: { studentId: student.studentId } },
      },
    });

    res.status(201).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({ error: "Could not update student" });
  }
});

///Update Paid
const updatePaid = asyncHandler(async (req, res) => {
  const { phoneNum } = req.params;
  const { paid } = req.body;
  try {
    const student = await prisma.student.findUnique({
      where: { phoneNum },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const updateStudent = await prisma.student.update({
      where: { phoneNum },
      data: {
        paid: Boolean(paid),
      },
    });
    res.status(201).json({ message: "successful" });
  } catch (error) {
    res.status(500).json({ error: "Could not update student" });
  }
});

// ///UPDATE
const updateStudentPoint = asyncHandler(async (req, res) => {
  const { phoneNum } = req.params;
  const { points } = req.body;
  try {
    const student = await prisma.student.findUnique({
      where: { phoneNum },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const updateStudent = await prisma.student.update({
      where: { phoneNum },
      data: {
        points: {
          increment: points,
        },
      },
    });
    res.status(201).json({ message: "successful" });
  } catch (error) {
    res.status(500).json({ error: "Could not update student" });
  }
});
module.exports = {
  getAllStudents,
  addStudent,
  createAnswers,
  updateStudentPoint,
  updatePaid,
  getStudent,
  // searchStudent,
};
