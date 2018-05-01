const router = require("express-promise-router")();
const controller = require("../controller");
const { validateBody, schemas } = require("../../JoiValidator");
require("../../../passport");
const passport = require("passport");
const { requireAuthMiddleware } = require("../../../passport");

const passportSignIn = (req, res, next) =>
  passport.authenticate("local", { session: false }, (err, user) => {
    req.user = user;
    next();
  })(req);

router
  .route("/signin")
  .post(validateBody(schemas.signIn), passportSignIn, controller.signIn);

router.route("/signup").post(validateBody(schemas.signUp), controller.signUp);

router.route("/").put(requireAuthMiddleware, controller.update);

module.exports = router;
