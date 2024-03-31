var TelegramMessageBuilder = require("./TelegramMessageBuilder");
module.exports = class {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.typingLoop = null;
  }
  get id() {
    return this.data.id;
  }
  async type() {
    await this.bot.client.sendChatAction(this.id, "typing");
  }
  async startTyping() {
    if (this.typingLoop === null) {
      await this.bot.client.sendChatAction(this.id, "typing");
      this.typingLoop = setInterval(() => this.type(), 4e3);
    }
  }
  stopTyping() {
    clearInterval(this.typingLoop);
    this.typingLoop = null;
  }
  async send(data) {
    if (typeof data === "string") {
      data = {
        "content": data
      };
    }
    if (data instanceof TelegramMessageBuilder) {
      data = data.data;
    }
    await this.bot.client.sendMessage(this.id, data.content, {
      "reply_parameters": data.replyParameters ? {
        "message_id": data.replyParameters.message.id,
        "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
        "allow_sending_without_reply": !1
      } : void 0,
      "reply_markup": data.replyMarkup ? data.replyMarkup : {
        "remove_keyboard": !0
      }
    });
    if (this.typingLoop !== null) {
      await this.type();
    }
  }
};