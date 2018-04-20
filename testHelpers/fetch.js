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
      return res.json()
    })
    .catch(e => console.log('fetch error', e));
}
