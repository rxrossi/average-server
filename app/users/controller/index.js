const passport = require("passport");
const User = require("../../users/model");
const { signToken } = require("../../../passport");

module.exports = {
  signIn,
  signUp
};

function signIn(req, res) {
  if (req.user) {
    return res.json({
      response: {
        token: signToken(req.user)
      }
    });
  }

  return res.json({
    error: {
      message: "Invalid credentials"
    }
  });
}

async function signUp(req, res) {
  const { email, password, confirmPassword } = req.body;

  // Check if there is a user with the same email
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res.status(403).json({
      error: {
        message: "Email is already in use"
      }
    });
  }

  if (password !== confirmPassword) {
    return res.json({
      error: { message: "Passwords does not match" }
    });
  }

  const user = new User({ email, password });

  // try to save
  try {
    await user.save((err, x) => {
      if (!err) {
        const token = signToken(user);
        return res.json({
          response: { token }
        });
      }
    });
  } catch (e) {
    return res.json({
      error: { message: "Could not create the account" }
    });
  }
}
