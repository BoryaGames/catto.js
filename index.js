var mod = {};
var version = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
var parts = ["random", "Server", "HTML", "request", "utils", "GitHub", "Base64", "Bitfield", "Application", "TelegramBot", "TelegramMessage", "TelegramChannel", "TelegramMessageBuilder", "TelegramInteraction", "TelegramPaymentInProgress", "TelegramPayment", "TelegramUser", "TelegramFile", "Oracle"];
if (version >= 18.20) {
  parts.push("Bot", "MessageBuilder");
}
if (version >= 10.4) {
  parts.push("User", "AuthClient");
}
parts.forEach(part => {
  mod[part] = require(`./${part}`);
});
module.exports = mod;

