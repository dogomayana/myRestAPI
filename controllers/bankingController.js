const asyncHandler = require("express-async-handler");
const db = require("../service/dbConnection");

const Joi = require("joi");

const createCustomer = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    customer_city: Joi.string(),
    customer_state: Joi.string(),
    email: Joi.string(),
    act_number: Joi.string().required(),
    bvn: Joi.number().required(),
    phoneNo: Joi.string().required(),
    balance: Joi.number().required(),
    account_type: Joi.string().required(),
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
    customer_state,
    email,
    phoneNo,
  } = value;
  try {
    await db.query("BEGIN");
    await db.query(
      `
      INSERT INTO customer_details(act_number, account_type, balance, bvn, customer_city, customer_state, email, phoneNo)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        act_number,
        account_type,
        balance,
        bvn,
        customer_city,
        customer_state,
        email,
        phoneNo,
      ]
    );
    await db.query("COMMIT");
    res.status(200).json("Created");
  } catch (error) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
});

///
const withdraw = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    act_number: Joi.string().required(),
    amount: Joi.number().strict(),
    balance: Joi.number().strict(),
    credit_from: Joi.string(),
    transaction_description: Joi.string(),
    transaction_type: Joi.string(),
    transaction_device: Joi.string(),
    transfer_to: Joi.string(),
    type: Joi.string(),
  });

  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const {
    act_number,
    amount,
    transfer_to,
    transaction_device,
    transaction_type,
  } = value;
  let descTime = new Date().toLocaleTimeString();
  let description = `${transaction_type}Transfer to ${transfer_to}, amount${amount}T${descTime}`;
  try {
    await db.query(`BEGIN`);

    const { rows } = await db.query(
      `SELECT act_number, balance FROM customer_details WHERE act_number = $1 `,
      [act_number]
    );
    if (rows.length == 0) {
      return res.status(200).json({ error: "Invalid Account Number" });
    }
    const { rows: noCustomer } = await db.query(
      `SELECT act_number FROM customer_details WHERE act_number = $1 `,
      [transfer_to]
    );
    if (noCustomer.length == 0) {
      return res.status(200).json({ error: "Account does not exist" });
    }
    if (amount > Number(rows[0].balance)) {
      return res.status(200).json({ error: "Insufficient Funds" });
    }

    const { rows: details } = await db.query(
      `INSERT INTO transaction_log(act_number, amount, transfer_to, transaction_description, transaction_device, transaction_type)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING* `,
      [
        act_number,
        amount,
        transfer_to,
        description,
        transaction_device,
        transaction_type,
      ]
    );
    await db.query(`COMMIT`);
    res.status(200).json(details);
  } catch (error) {
    await db.query(`ROLLBACK`);
    res.status(500).json(error.message);
  }
});

////
const deposit = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    act_number: Joi.string().required(),
    amount: Joi.number().strict(),
    balance: Joi.number(),
    credit_from: Joi.string(),
    transaction_description: Joi.string(),
    transaction_type: Joi.string(),
    transaction_device: Joi.string(),
    transfer_to: Joi.string(),
    type: Joi.string(),
  });

  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const {
    act_number,
    amount,
    credit_from,
    transaction_device,
    transaction_type,
  } = value;
  let descTime = new Date().toLocaleTimeString();
  let description = `${transaction_type}CrFrm ${credit_from}, amount${amount}T${descTime}`;
  try {
    const { rows } = await db.query(
      `SELECT act_number, balance FROM customer_details WHERE act_number = $1 `,
      [credit_from]
    );

    if (rows.length == 0) {
      return res.status(200).json({ error: "Invalid Account Number" });
    }
    if (amount > Number(rows[0].balance)) {
      return res.status(200).json({ error: "Insufficient Funds" });
    }
    const { rows: noCustomer } = await db.query(
      `SELECT act_number FROM customer_details WHERE act_number = $1 `,
      [act_number]
    );
    if (noCustomer.length == 0) {
      return res.status(200).json({ error: "Account does not exist" });
    }

    await db.query("BEGIN");

    const { rows: details } = await db.query(
      `
    INSERT INTO transaction_log(act_number, amount, credit_from, transaction_description, transaction_device, transaction_type)
    VALUES($1,$2,$3,$4,$5,$6)`,
      [
        act_number,
        amount,
        credit_from,
        description,
        transaction_device,
        transaction_type,
      ]
    );
    res.status(200).json(details[0]);
    await db.query("COMMIT");
  } catch (error) {
    res.status(500).json(error.message);
    await db.query("ROLLBACK");
  }
});

///
const getAllCustomersDetails = asyncHandler(async (req, res) => {
  try {
    const { rows } = await db.query(`
        SELECT * FROM customer_details;
        `);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

///
const getCustomerDetails = asyncHandler(async (req, res) => {
  const signupSchema = Joi.object({
    actNumber: Joi.number().required(),
  });

  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { actNumber } = value;
  try {
    const { rows } = await db.query(
      `
      SELECT * FROM customer LEFT OUTER JOIN customer_transaction ON customer.customer_act_num = customer_transaction.customer_act_num WHERE customer.customer_act_num = $1`,
      [actNumber]
    );
    if (rows.length == 0) {
      res.status(200).json({ error: "Invalid Account Number" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = {
  withdraw,
  createCustomer,
  getAllCustomersDetails,
  getCustomerDetails,
  deposit,
};
