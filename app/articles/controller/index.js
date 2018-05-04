const Article = require("../model");

module.exports = {
  getAll,
  getByLink,
  create,
  getUserArticles
};

const defaultPopulate = { path: "author" };

async function create(req, res) {
  const { content } = req.body;
  const article = new Article({
    author: req.user.id,
    ...req.body
  });

  return article.save((err, x) => {
    if (x) {
      const articleWithoutAuthor = x;
      delete articleWithoutAuthor.author;
      return res.json({
        response: {
          message: "Article saved",
          article: x
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

async function getAll(req, res) {
  const articles = await Article.find({}).populate(defaultPopulate);
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
