const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const db = require("../service/dbConnection");
const { jwtTokens } = require("../utils/authToken");

const register = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    act_number: Joi.string().regex(/^\d+$/).required(),
    account_type: Joi.string().required(),
    balance: Joi.number().strict().required(),
    bvn: Joi.number().strict().required(),
    customer_city: Joi.string().required(),
    customer_firstname: Joi.string().required(),
    customer_lastname: Joi.string().required(),
    customer_pswd: Joi.string().required(),
    customer_state: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    phoneNo: Joi.string().regex(/^\d+$/).required(),
  });
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    act_number,
    account_type,
    balance,
    bvn,
    customer_city,
    customer_firstname,
    customer_lastname,
    customer_pswd,
    customer_state,
    email,
    phoneNo,
  } = value;

  try {
    const hashedPassword = await bcrypt.hash(customer_pswd, 10);

    const { rows: exist } = await db.query(
      `SELECT $1 FROM customer_details WHERE act_number = $1`,
      [act_number]
    );
    if (exist.length !== 0) {
      return res.status(400).json("Account Exists");
    }

    const { rows } = await db.query(
      `INSERT INTO customer_details(act_number, account_type, balance, bvn, customer_city, customer_firstname, customer_lastname, customer_pswd, customer_state, email, phoneNo)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING*`,
      [
        act_number,
        account_type,
        balance,
        bvn,
        customer_city,
        customer_firstname,
        customer_lastname,
        hashedPassword,
        customer_state,
        email,
        phoneNo,
      ]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

const logIn = asyncHandler(async (req, res) => {
  const loginSchema = Joi.object({
    act_number: Joi.string().regex(/^\d+$/).required(),
    password: Joi.string().required(),
  });
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { act_number, password } = value;

  try {
    const { rows } = await db.query(
      `SELECT act_number, customer_firstname, customer_lastname, customer_pswd FROM customer_details WHERE act_number = $1`,
      [act_number]
    );

    if (rows.length === 0) {
      return res.status(400).json("Invalid account");
    }
    const passwordMatch = await bcrypt.compare(password, rows[0].customer_pswd);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid Credential" });
    }
    let data = rows[0];

    const token = jwtTokens(data);
    res.cookie("token", token, {
      httpOnly: true,
    });
    return res.status(200).json({
      account: data.act_number,
      fname: data.customer_firstname,
      lname: data.customer_lastname,
      token,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

module.exports = { register, logIn };
