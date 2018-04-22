const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(cors());

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.use("/users", require("./users/routes"));

module.exports = port =>
  mongoose.connect("mongodb://localhost/average").then(() => app.listen(port));
