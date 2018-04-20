const express = require("express");
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.use('/users', require('./users/routes'))

module.exports = port => app.listen(port);
