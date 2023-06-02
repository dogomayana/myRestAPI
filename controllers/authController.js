const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/authHelper");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const Joi = require("joi");

const signUp = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name, email, phone, password } = value;

    let userExits;
    if (email.includes("@")) {
      userExits = await prisma.user.findUnique({
        where: { email },
      });
    } else {
      userExits = await prisma.user.findUnique({
        where: { phone },
      });
    }

    if (userExits) {
      return res.status(401).json({ error: "Already registered user" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, role: email, password: hashedPassword, phone },
    });
    const token = generateToken(user.id, user.role);

    // res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ token, name: user.name });
  } catch (error) {
    res.status(500).json("error registering");
  }
});

// Login
const logIn = asyncHandler(async (req, res) => {
  const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
  });
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { identifier, password } = value;
    let user;
    if (identifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { phone: identifier },
      });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid Credential" });
    }
    const token = generateToken(user.id, user.role);
    // res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ token, name: user.name });

    // res.status(201).json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json("error registering");
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
});

// Search User
const searchUser = asyncHandler(async (req, res) => {
  try {
    const searchQuery = req.query.searchQuery;
    if (!searchQuery) {
      res.status(401).json("Empty params");
    }

    const search = await prisma.user.findMany();
    res.status(200).json(search);
  } catch (error) {
    console.error({ error });
    res.status(500).json({ error: "Internal error" });
  }
});

const deleteAllUsers = asyncHandler(async (req, res) => {
  try {
    // await prisma.user.deleteMany();
    await prisma.user.deleteMany();
    res.status(201).json({ message: "Users deleted successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
});

module.exports = { signUp, logIn, getAllUsers, deleteAllUsers, searchUser };
