var request = require("./request");
var Base64 = require("./Base64");
/**
 * Class for reading and writing data to a Github repository.
 * 
 * @class Github
 */
class GitHub {
  /**
   * Creates an instance of Github.
   * 
   * @constructor
   * @param {object} [options={}] - Options to initialize the instance.
   * @param {string} [options.token=""] - Github API token.
   * @param {string} [options.username=""] - Github username.
   * @param {string} [options.repository=""] - Name of the repository.
   * @param {string} [options.message="cattojs"] - Commit message.
   * 
   */
  constructor(options) {
    this.options = Object.assign({
      "token": "",
      "username": "",
      "repository": "",
      "message": "cattojs"
    }, options || {});
    this.shas = {};
  }
  /**
   * Reads data from a file in the Github repository.
   * 
   * @param {string} file - Path to the file to be read.
   * @param {boolean} [b64mode=false] - Whetever return data encoded in base64 or not.
   * 
   * @returns {(string|object)} - The content of the file. If the file is a JSON file, returns a parsed object, otherwise returns a string.
   * 
   * @async
   * @throws {Error} If there is a problem with the API request.
   */
  async read(file, b64mode) {
    var value = (await request.get({
      "url": `https://api.github.com/repos/${this.options.username}/${this.options.repository}/contents/${file}`,
      "headers": {
        "User-Agent": this.options.username,
        "Authorization": `token ${this.options.token}`
      }
    })).body;
    this.shas[file] = value.sha;
    value = value.content;
    if (!b64mode) {
      value = Base64.decode(value);
      try {
        value = JSON.parse(value);
      } catch(e) {}
    }
    return value;
  }
  /**
   * Writes data to a file in the Github repository.
   * 
   * @param {string} file - Path to the file to be written.
   * @param {(string|object)} value - The data to be written to the file. If it is an object, it will be stringified as a JSON file.
   * @param {boolean} [b64mode=false] - Whetever is data to be written is encoded in base64 or not.
   * 
   * @returns {boolean} - Returns true if the write was successful.
   * 
   * @async
   * @throws {Error} If there is a problem with the API request.
   */
  async write(file, value, b64mode) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    this.shas[file] = (await request.put({
      "url": `https://api.github.com/repos/${this.options.username}/${this.options.repository}/contents/${file}`,
      "headers": {
        "User-Agent": this.options.username,
        "Authorization": `token ${this.options.token}`,
        "Content-Type": "application/json"
      },
      "body": JSON.stringify({
        "content": (b64mode ? value : Base64.encode(value)),
        "message": this.options.message,
        "sha": this.shas[file]
      })
    })).body.content.sha;
    return !0;
  }
}
module.exports = GitHub;
