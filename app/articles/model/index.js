const mongoose = require("mongoose");

const schema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  published: {
    type: Boolean,
    required: true
  },
  creationDate: {
    type: mongoose.Schema.Types.Date,
    default: Date.now()
  }
});

const Article = mongoose.model("Article", schema);

module.exports = Article;
