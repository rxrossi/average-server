const passport = require("passport");
const User = require("../../users/model");
const { signToken } = require("../../../passport");

module.exports = {
  signIn,
  signUp,
  update,
  getById,
  getCurrentUserProfile
};

async function getCurrentUserProfile(req, res) {
  const user = await User.findById(req.user.id);

  if (user) {
    return res.json({
      response: {
        user
      }
    });
  }

  return res.json({
    error: {
      message: "User not found"
    }
  });
}

async function getById(req, res) {
  const user = await User.findById(req.params.id);

  if (user) {
    return res.json({
      response: {
        user
      }
    });
  }

  return res.json({
    error: {
      message: "User not found"
    }
  });
}

async function update(req, res) {
  const user = await User.findById(req.user.id);
  (user.photoLocation = req.body.photoLocation), (user.name = req.body.name);
  await user.save(err => {
    if (err) {
      return res.json({
        error: {
          message: "User could not be updated",
          details: err
        }
      });
    }
    return res.json({
      response: {
        message: "User updated",
        user
      }
    });
  });
}

function signIn(req, res) {
  const { user } = req;
  if (user) {
    const userWithoutPw = user.toObject();
    delete userWithoutPw.password;
    return res.json({
      response: {
        token: signToken(req.user),
        user: userWithoutPw
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
        // Remover Password to return
        const userWithoutPw = x.toObject();
        delete userWithoutPw.password;

        const token = signToken(user);
        return res.json({
          response: { token, user: userWithoutPw }
        });
      }
    });
  } catch (e) {
    return res.json({
      error: { message: "Could not create the account" }
    });
  }
}
