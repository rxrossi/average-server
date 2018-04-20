const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.use("/users", require("./users/routes"));

module.exports = port =>
  mongoose.connect("mongodb://localhost/average").then(() => app.listen(port));
