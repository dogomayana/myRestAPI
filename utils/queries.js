const db = require("../service/dbConnection");

function createTable() {
  db.query(`
    CREATE TABLE transaction_logs (
      transaction_id SERIAL PRIMARY KEY,
      act_number BIGINT REFERENCES customer (act_number),
      transaction_time TIMESTAMP DEFAULT now(),
      bank TEXT NOT NULL,
      bank_act BIGINT,
      receiver_name TEXT,
      sender_name TEXT,
      amount NUMERIC,
      description TEXT,
      type VARCHAR(7),
      balance NUMERIC
    )
    `);
}
module.exports = createTable;
