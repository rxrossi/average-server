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
      type: String
    },
    tags: [String],
    published: {
      type: Boolean,
      default: false
    },
    mainImg: {
      type: String
    },
    description: {
      type: String
    },
    title: {
      type: String
    },
    link: {
      type: String,
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
