var mod = {};
["random", "Server", "HTML", "request", "AuthClient", "utils", "GitHub", "Base64", "User", "Bitfield", "Flags", "Bot", "Application", "MessageBuilder"].forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;
