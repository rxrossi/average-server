const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const setupFileStorageRoutes = require("./files/routes");

app.use(bodyParser.json());
// app.use(morgan("tiny"));
app.use(cors());

setupFileStorageRoutes(app, "/files");

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.use("/users", require("./users/routes"));

app.use("/articles", require("./articles/routes"));

module.exports = port =>
  mongoose.connect("mongodb://localhost/average").then(() => app.listen(port));
