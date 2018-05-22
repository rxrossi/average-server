try {
  require('dotenv').config()
} catch (e) {
  console.log(e)
} finally {
  module.exports = {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    MONGODB: process.env.MONGODB,
    MONGODB_TEST: process.env.MONGODB_TEST,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ISS: process.env.JWT_ISS
  }
}
