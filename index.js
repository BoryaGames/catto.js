var mod = {};
["random", "Server", "HTML", "request", "AuthClient", "utils", "GitHub", "Base64"].forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;