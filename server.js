const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const bankingRoutes = require("./routes/bankingRoutes");
const port = 2025;
const cors = require("cors");
require("dotenv").config();
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use("/", bankingRoutes);

// app.get("/", withdraw);

app.listen(port, () => {
  console.log(`listening from http://localhost:${port}`);
});
