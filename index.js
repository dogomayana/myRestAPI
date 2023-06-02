const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const studentsRoutes = require("./routes/studentsRoutes");
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
const port = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentsRoutes);
app.use("/api/v1/courses", courseRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
