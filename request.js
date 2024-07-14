/** @module request */

var { default: fetch, Headers, Request, Response } = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

function wrap(method, options) {
  var options2 = Object.assign({}, options);
  var url = options2.url;
  delete options2.url;
  return new Promise((res, rej) => {
    request[method](url, options2).then(response => {
      response.text().then(body => {
        try {
          body = JSON.parse(body);
        } catch {}
        res({
          response, body
        });
      });
    }).catch(rej);
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
 * PATCH request.
 * @param {object} options
 * @return {promise}
 */
function patch(options) {
  return wrap("patch", options);
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
  get, post, patch, put
};
