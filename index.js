var mod = {};
var version = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
var parts = ["random", "Server", "HTML", "request", "AuthClient", "utils", "GitHub", "Base64", "User", "Bitfield", "Application", "TelegramBot", "TelegramMessage", "TelegramChannel", "TelegramMessageBuilder", "TelegramInteraction", "TelegramUser", "TelegramFile"];
if (version >= 18.20) {
  parts.push("Bot", "MessageBuilder");
}
parts.forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;
