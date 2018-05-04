const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};

const schema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tags: [String],
    published: {
      type: Boolean,
      required: true
    },
    mainImg: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true,
      unique: true
    },
    creationDate: {
      type: mongoose.Schema.Types.Date,
      default: Date.now()
    }
  },
  schemaOptions
);

schema.plugin(uniqueValidator);
const Article = mongoose.model("Article", schema);

module.exports = Article;
