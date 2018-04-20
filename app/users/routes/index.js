const router = require("express-promise-router")();
const controller = require("../controller");
const { validateBody, schemas } = require("../../JoiValidator");

router.route("/signin").post(controller.signIn);

router.route("/signup").post(
  validateBody(schemas.signUp),
  controller.signUp
);

module.exports = router;
