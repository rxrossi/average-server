const fetch = require("isomorphic-fetch");

module.exports = function fetchHelper(endpoint, opts) {
  return fetch(endpoint, opts)
    .then(res => {
      if (res.status === 404) {
        return { error: { message: endpoint + " not found" } };
      }
      if (res.status === 500) {
        return { error: { message: "Server error (500)" } };
      }

      try {
        return res.json();
      } catch (e) {
        if (res.status >= 300) {
          return { error: { message: `error (${res.status})` } };
        }
      }
    })
    .catch(e => console.log(e));
};
