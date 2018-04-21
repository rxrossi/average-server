require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISS: process.env.JWT_ISS,
};
