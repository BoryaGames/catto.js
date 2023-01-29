var request = require("./request");
var Base64 = require("./Base64");
module.exports = class {
  constructor(options) {
    this.options = Object.assign({
      "token": "",
      "username": "",
      "repository": "",
      "message": "cattojs"
    }, options || {});
  }
  async read(file) {
    var value = Base64.decode((await request.get({
      "url": `https://api.github.com/repos/${this.options.username}/${this.options.repository}/contents/${file}`,
      "headers": {
        "User-Agent": this.options.username,
        "Authorization": `token ${this.options.token}`
      }
    })).body.content);
    try {
      value = JSON.parse(value);
    } catch(e) {}
    return value;
  }
  async write(file, value) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    await request.put({
      "url": `https://api.github.com/repos/${this.options.username}/${this.options.repository}/contents/${file}`,
      "headers": {
        "User-Agent": this.options.username,
        "Authorization": `token ${this.options.token}`
      },
      "json": !0,
      "body": {
        "content": Base64.encode(value),
        "message": this.options.message
      }
    });
    return !0;
  }
};