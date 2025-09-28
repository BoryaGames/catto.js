var path = require("path");
var common = null;

module.exports = class {
  constructor(options, client) {
    this.options = Object.assign({
      "config": "config",
      "profile": "DEFAULT"
    }, options || {});
    if (client) {
      this.client = client;
    } else {
      common = require("oci-common");
      this.client = {};
      this.client.provider = new common.ConfigFileAuthenticationDetailsProvider(path.join(__dirname, "..", "..", this.options.config), this.options.profile);
      this.client.signer = new common.DefaultRequestSigner(this.client.provider);
    }
  }
  async fetch(uri, options) {
    if (!options) {
      options = {};
    }
    if (!options.method) {
      options.method = "GET";
    }
    if (!options.headers) {
      options.headers = {};
    }
    options.uri = uri;
    if (options.body) {
      if (typeof options.body === "object" && !options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
      }
      if (!options.headers["Content-Length"]) {
        options.headers["Content-Length"] = options.body.length;
      }
    }
    var headers = options.headers;
    options.headers = new Headers;
    for (var key in headers) {
      options.headers.set(key, headers[key]);
    }
    await this.client.signer.signHttpRequest(options);
    return fetch(options.uri, options);
  }
};
