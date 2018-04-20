const User = require('../../users/model')

module.exports = {
  signIn,
  signUp,
}

function signIn(req, res) {
  return res.json({
    error: { message: "Invalid credentials" }
  });
}

async function signUp(req, res) {
  const {email, password, confirmPassword } = req.body;

  // Check if there is a user with the same email
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res.status(403).json({ error: {
      message: 'Email is already in use'
    }});
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
        return res.json({
          response: { token: "a token" }
        });
      }
    });
  } catch(e) {
    return res.json({
      error: { message: "Could not create the account" }
    });
  }

}
