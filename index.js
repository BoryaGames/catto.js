var mod = {};
["random", "Server", "HTML", "request", "AuthClient", "utils", "GitHub", "Base64", "User"].forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;
