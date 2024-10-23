var TelegramChannel = require("./TelegramChannel");
var TelegramUser = require("./TelegramUser");

module.exports = class {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
    this.channel = new TelegramChannel(this._data.chat, bot);
    this.user = this.bot.users.get(this._data.from.id) || new TelegramUser(this._data.from, bot);
    this.user.data = this._data.from;
    this.bot.users.set(this.user.id, this.user);
  }
  get id() {
    return this._data.message.successful_payment.telegram_payment_charge_id;
  }
  get data() {
    return this._data.message.successful_payment.invoice_payload;
  }
  get price() {
    return this._data.message.successful_payment.total_amount;
  }
};