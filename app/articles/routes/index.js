const router = require("express-promise-router")();
const controller = require("../controller");
const { requireAuthMiddleware } = require("../../../passport");

router
  .route("/")
  .get(controller.getAll)
  .post(requireAuthMiddleware, controller.create);

router
  .route("/my-articles")
  .get(requireAuthMiddleware, controller.getUserArticles);

router
  .route("/:link")
  .get(controller.getByLink)
  .put(requireAuthMiddleware, controller.updateByLink);

module.exports = router;
