var mod = {};
["random", "Server", "HTML", "request", "AuthClient", "utils", "GitHub", "Base64", "User", "Bitfield", "Bot", "Application", "MessageBuilder", "TelegramBot", "TelegramMessage", "TelegramChannel", "TelegramMessageBuilder", "TelegramInteraction", "TelegramUser", "TelegramFile"].forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;
