module.exports = {
  signIn,
  signUp,
}

function signIn(req, res) {
  return res.json({
    error: { message: "Invalid credentials" }
  });
}

function signUp(req, res) {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.json({
      error: { message: "Passwords does not match" }
    });
  }
  return res.json({
    error: { message: "signup err, from controller" }
  });
}
