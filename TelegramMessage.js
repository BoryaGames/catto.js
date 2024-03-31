var TelegramChannel = require("./TelegramChannel");
var TelegramUser = require("./TelegramUser");
module.exports = class {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.channel = new TelegramChannel(this.data.chat, bot);
    this.user = new TelegramUser(this.data.from, bot);
  }
  get id() {
    return this.data.message_id;
  }
  get content() {
    return this.data.text;
  }
  reply(data) {
    if (typeof data !== "object") {
      data = {
        "content": data
      };
    }
    return this.channel.send(Object.assign({
      "replyParameters": {
        "message": this
      }
    }, data));
  }
};
