var TelegramMessage = require("./TelegramMessage");
module.exports = class {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
    this.message = new TelegramMessage(this._data.callbackQuery.message, bot);
  }
  get id() {
    return this._data.callbackQuery.id;
  }
  get data() {
    return this._data.callbackQuery.data;
  }
  async notify(text) {
    await this.bot.client.telegram.answerCbQuery(this.id, text);
  }
  async modal(text) {
    await this.bot.client.telegram.answerCbQuery(this.id, text, {
      "show_alert": !0
    });
  }
};