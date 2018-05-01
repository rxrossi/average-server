const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");

const schema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  photo: String,
  name: String
});

schema.pre("save", async function(next) {
  if (this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  }
  next();
});

schema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

schema.plugin(uniqueValidator);

const User = mongoose.model("User", schema);

module.exports = User;
