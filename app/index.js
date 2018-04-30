const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const storage = path.join(process.cwd(), `fileStorage`);

app.use(bodyParser.json());
// app.use(morgan("tiny"));
app.use(cors());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.post("/files", (req, res) => {
  if (!req.files) {
    return res.status(422).json({
      error: {
        message: "No files receive"
      }
    });
  }
  const file = req.files.file;
  const fileName = Date.now() + file.name;

  //move the file
  const filePath = path.join(storage, fileName);

  file.mv(filePath, err => {
    if (err) {
      console.error("err", err);
      return res.status(500).json(err);
    }
  });

  res.json({
    response: {
      storedAt: "/files/" + fileName
    }
  });
});

app.use("/files", express.static(storage));

app.use("/users", require("./users/routes"));

app.use("/articles", require("./articles/routes"));

module.exports = port =>
  mongoose.connect("mongodb://localhost/average").then(() => app.listen(port));
