const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const Joi = require("joi");

const addCourse = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    overview: Joi.string().required(),
    title: Joi.string().required(),
    courseSlug: Joi.string().required(),
    coursePics: Joi.string().required(),
  });

  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { overview, title, courseSlug, coursePics } = value;

    // Uncomment later when you have push the new migration

    // const courseExits = await prisma.course.findUnique({
    //   where: { title },
    // });

    // if (courseExits) {
    //   return res.status(401).json({ error: "Course Exits" });
    // }
    const createdCourse = await prisma.course.create({
      data: {
        overview,
        title,
        courseSlug,
        coursePics,
      },
    });
    res.status(201).json({ message: "created", createdCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create new course" });
  }
});

// ////
const getAllCourse = asyncHandler(async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
      },
    });
    if (!courses) {
      res.status(200).json({ message: "No courses available" });
    }
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving students" });
  }
});

// ///
const getCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const courseExits = await prisma.course.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!courseExits) {
      res.status(404).json("No course found");
    }

    const course = await prisma.course.findMany({
      include: {
        lessons: true,
      },
    });
    res.status(200).json(course);
  } catch (error) {
    console.error({ error });
    res.status(500).json({ error: "can get course" });
  }
});

///
const addLesson = asyncHandler(async (req, res) => {
  const lessonSchema = Joi.object({
    content: Joi.string().required(),
    title: Joi.string().required(),
    courseSlug: Joi.string().required(),
    // id: Joi.number().required(),
    lessonPics: Joi.string().required(),
    lessonSlug: Joi.string().required(),
  });
  //   const { id } = req.params;
  try {
    const { error, value } = lessonSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { courseSlug, title, content, lessonPics, lessonSlug } = value;

    //change later to slug
    const course = await prisma.course.findFirst({
      where: {
        courseSlug: courseSlug,
      },
    });

    if (!course) {
      res.status(404).json({ error: "Invalid course" });
    }

    ///Change to lessonSlug when you have made the new migration
    const lessonExist = await prisma.lesson.findFirst({
      where: {
        lessonSlug: lessonSlug,
      },
    });

    if (lessonExist) {
      res.status(404).json({ error: "Lesson Exist, do you want to update?" });
    }
    const createLesson = await prisma.lesson.create({
      data: {
        title,
        content,
        lessonPics,
        lessonSlug,
        course: {
          connect: { id: course.id },
        },
      },
    });

    res.status(200).json(createLesson);
  } catch (error) {
    console.error({ error });
    res.status(500).json({ error: "failed to create lesson" });
  }
});

const deleteAllCourses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed deleting courses" });
  }
});
module.exports = {
  addCourse,
  getAllCourse,
  addLesson,
  getCourse,
  deleteAllCourses,
};
