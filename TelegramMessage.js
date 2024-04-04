var TelegramChannel = require("./TelegramChannel");
var TelegramUser = require("./TelegramUser");
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
