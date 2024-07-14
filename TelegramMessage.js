var TelegramChannel = require("./TelegramChannel");
var TelegramUser = require("./TelegramUser");
var TelegramMessageBuilder = require("./TelegramMessageBuilder");
module.exports = class {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.channel = new TelegramChannel(this.data.chat, bot);
    this.user = this.bot.users.get(this.data.from.id) || new TelegramUser(this.data.from, bot);
    this.user.data = this.data.from;
    this.bot.users.set(this.user.id, this.user);
  }
  get id() {
    return this.data.message.message_id;
  }
  get content() {
    return this.data.message.text;
  }
  reply(data) {
    if (typeof data !== "object") {
      data = {
        "content": data
      };
    }
    if (data instanceof TelegramMessageBuilder) {
      data.data.replyParameters = {
        "message": this
      };
      return this.channel.send(data);
    }
    return this.channel.send(Object.assign({
      "replyParameters": {
        "message": this
      }
    }, data));
  }
};
