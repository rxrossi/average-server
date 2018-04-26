const router = require("express-promise-router")();
const controller = require("../controller");
const { requireAuthMiddleware } = require("../../../passport");

router
  .route("/")
  .get(controller.getAll)
  .post(requireAuthMiddleware, controller.create);

module.exports = router;
