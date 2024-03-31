var TelegramMessage = require("./TelegramMessage");
module.exports = class {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
    this.message = new TelegramMessage(this._data.message, bot);
  }
  get id() {
    return this._data.id;
  }
  get data() {
    return this._data.data;
  }
  async notify(text) {
    await this.bot.client.answerCallbackQuery(this.id, { text });
  }
  async modal(text) {
    await this.bot.client.answerCallbackQuery(this.id, {
      text,
      "show_alert": !0
    });
  }
};