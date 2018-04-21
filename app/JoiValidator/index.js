const Joi = require("joi");

const joiOpts = {
  convert: true,
  abortEarly: false
};

module.exports = {
  validateBody: schema => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schema, joiOpts);
      if (result.error) {
        return res.status(400).json({
          error: {
            fields: toFormFeedback(result.error.details)
          }
        });
      }
      // if (!req.value) { req.value = {}; }
      // req.value['body'] = result.value;
      next();
    };
  },

  schemas: {
    signUp: Joi.object().keys({
      email: Joi.string()
        .email()
        .required()
        .label("Email"),
      password: Joi.string()
        .required()
        .label("Password"),
      confirmPassword: Joi.string()
        .required()
        .label("Confirm password")
    }),
    signIn: Joi.object().keys({
      email: Joi.string()
        .email()
        .required()
        .label("Email"),
      password: Joi.string()
        .required()
        .label("Password")
    })
  }
};

function toFormFeedback(arr) {
  const errors = {};
  arr.forEach(x => {
    changeObject(errors, x.message, x.path);
  });
  return errors;
}

function changeObject(obj, value, path, typeOfOperation = "modify") {
  const pathToReduce = Array.isArray(path) ? path : [path];

  pathToReduce.reduce((dir, p, i, arr) => {
    if (i + 1 === arr.length) {
      if (typeOfOperation === "append_to_arr") {
        return (dir[p] = [...(dir[p] || []), value]);
      } else if (typeOfOperation === "remove_of_arr") {
        return (dir[p] = [
          ...dir[p].slice(0, value),
          ...dir[p].slice(value + 1)
        ]);
      }
      return (dir[p] = value);
    }
    if (dir[p]) {
      return dir[p];
    }
    return (dir[p] = typeof arr[i + 1] === "number" ? [] : {});
  }, obj);

  return obj;
}
