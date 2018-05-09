const Article = require("../model");

module.exports = {
  getAll,
  getByLink,
  create,
  getUserArticles,
  updateByLink,
  deleteByLink
};

const defaultPopulate = { path: "author" };

async function create(req, res) {
  const article = new Article({
    author: req.user.id,
    ...req.body
  }).populate("author");

  return article.save(async (err, x) => {
    if (x) {
      const articleWithAuthorObj = await Article.findById(x.id).populate(
        "author"
      );
      return res.json({
        response: {
          message: "Article saved",
          article: articleWithAuthorObj
        }
      });
    }

    if (err) {
      const fields = Object.entries(err.errors).reduce((prev, [key, value]) => {
        prev[key] = value.message;
        return prev;
      }, {});

      return res.status(422).json({
        error: {
          message: "Could not save the article",
          code: 422,
          fields
        }
      });
    }

    return x;
  });
}

async function updateByLink(req, res) {
  const { link } = req.params;
  const { body } = req;
  delete body.author;

  const article = await Article.findOne({ link }).populate("author");
  if (article.author.id !== req.user.id) {
    return res.json({
      error: {
        message: "This article does not belong to the authenticated user"
      }
    });
  }
  article.set(body);
  await article.save();

  return res.json({
    response: { message: "Article updated", article }
  });
}

async function getAll(req, res) {
  const articles = await Article.find({ published: true }).populate(
    defaultPopulate
  );
  return res.json({
    response: { articles }
  });
}

async function deleteByLink(req, res) {
  const { link } = req.params;

  const article = await Article.findOne({ link });

  if (article.author.toString() !== req.user.id) {
    return res.json({
      error: {
        message: "This article does not belong to the authenticated user"
      }
    });
  }

  article.remove();

  return res.json({
    response: { message: "Article deleted" }
  });
}

async function getAll(req, res) {
  const articles = await Article.find({ published: true }).populate(
    defaultPopulate
  );
  return res.json({
    response: { articles }
  });
}

async function getUserArticles(req, res) {
  const articles = await Article.find({ author: req.user.id }).populate(
    defaultPopulate
  );
  return res.json({
    response: { articles }
  });
}

async function getByLink(req, res) {
  const { link } = req.params;
  const article = await Article.findOne({ link }).populate(defaultPopulate);
  return res.json({
    response: {
      article
    }
  });
}
