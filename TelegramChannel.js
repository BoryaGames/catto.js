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
    await this.bot.client.telegram.sendChatAction(this.id, "typing");
  }
  async startTyping() {
    if (this.typingLoop === null) {
      await this.type();
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
    if (data.media && data.media.length) {
      await this.bot.client.telegram.sendMediaGroup(this.id, data.media.map((media, index) => {
        if (index < 1) {
          return {
            "type": (media.type == "image") ? "photo" : media.type,
            "media": media.url,
            "caption": data.content,
            "show_caption_above_media": data.textAbove
          };
        }
        return {
          "type": (media.type == "image") ? "photo" : media.type,
          "media": media.url,
          "show_caption_above_media": data.textAbove
        };
      }), Object.assign({
        "reply_parameters": data.replyParameters ? {
          "message_id": data.replyParameters.message.id,
          "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
          "allow_sending_without_reply": !1
        } : void 0,
        "reply_markup": data.replyMarkup ? data.replyMarkup : {
          "remove_keyboard": !0
        }
      }, data.extra));
    } else {
      await this.bot.client.telegram.sendMessage(this.id, data.content, Object.assign({
        "reply_parameters": data.replyParameters ? {
          "message_id": data.replyParameters.message.id,
          "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
          "allow_sending_without_reply": !1
        } : void 0,
        "reply_markup": data.replyMarkup ? data.replyMarkup : {
          "remove_keyboard": !0
        }
      }, data.extra));
    }
    if (this.typingLoop !== null) {
      await this.type();
    }
  }
  async sendPayment(data) {
    if (typeof data === "string") {
      data = {
        "content": data
      };
    }
    if (data instanceof TelegramMessageBuilder) {
      data = data.data;
    }
    await this.bot.client.telegram.sendInvoice(this.id, {
      "reply_parameters": data.replyParameters ? {
        "message_id": data.replyParameters.message.id,
        "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
        "allow_sending_without_reply": !1
      } : void 0,
      "reply_markup": data.replyMarkup ? data.replyMarkup : {
        "remove_keyboard": !0
      }
    }, data.invoiceExtra);
    if (this.typingLoop !== null) {
      await this.type();
    }
  }

};





