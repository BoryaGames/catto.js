var cattojs = {};

var parts = ["utils", "random", "Base64", "MD5", "Server", "request", "Bitfield", "GitHub", "Oracle", "Discord", "Telegram"];

parts.forEach(part => {
  try {
    cattojs[part] = require(`./${part}`);
  } catch(_) {}
});

module.exports = cattojs;