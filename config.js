require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  MONGODB: process.env.MONGODB,
  MONGODB_TEST: process.env.MONGODB_TEST,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISS: process.env.JWT_ISS
};
