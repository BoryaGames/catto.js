module.exports = class {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
  }
  get id() {
    return this._data.update.pre_checkout_query.id;
  }
  get data() {
    return this._data.update.pre_checkout_query.invoice_payload;
  }
  async approve() {
    await this.bot.client.telegram.answerPreCheckoutQuery(this.id, !0);
  }
  async decline(text) {
    await this.bot.client.telegram.answerPreCheckoutQuery(this.id, !1, text);
  }
};