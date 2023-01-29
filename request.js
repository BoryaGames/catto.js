/** @module request */

var request = require("request");

function wrap(method, options) {
  return new Promise((res, rej) => {
    request[method](options, (error, response, body) => {
      if (error) {
        return rej(error);
      }
      try {
        body = JSON.parse(body);
      } catch(e) {}
      res({
        response, body
      });
    });
  });
}

/**
 * GET request.
 * @param {object} options
 * @return {promise}
 */
function get(options) {
  return wrap("get", options);
}

/**
 * POST request.
 * @param {object} options
 * @return {promise}
 */
function post(options) {
  return wrap("post", options);
}

/**
 * PUT request.
 * @param {object} options
 * @return {promise}
 */
function put(options) {
  return wrap("put", options);
}

module.exports = {
  get, post, put
};