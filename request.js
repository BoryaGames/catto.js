/** @module request */

if (!globalThis.fetch) {
  var { default: fetch, Headers, Request, Response } = require("node-fetch");
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
if (globalThis.fetch && typeof fetch === "undefined") {
  var fetch = globalThis.fetch;
}

function wrap(method, options) {
  if (typeof options === "string") {
    options = {
      "url": options
    };
  }
  var options2 = Object.assign({}, options);
  var url = options2.url;
  delete options2.url;
  options2.method = method.toUpperCase();
  return new Promise((res, rej) => {
    fetch(url, options2).then(response => {
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
