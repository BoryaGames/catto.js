var events = require("events");
var crypto = require("crypto");
var grammy = null;

if (typeof EventEmitter === "undefined") {
  var { EventEmitter } = events;
}

class Bot extends EventEmitter {
  constructor(options, client) {
    super();
    this.options = Object.assign({
      "token": "",
      "api": "https://api.telegram.org",
      "debug": false,
      "test": false
    }, options || {});
    try {
      grammy = grammy || require("grammy");
    } catch(_) {
      throw "Failed to activate Telegram support.";
    }
    if (client) {
      this.client = client;
    } else {
      this.client = new grammy.Bot(this.options.token, {
        "client": {
          "apiRoot": this.options.api,
          "environment": this.options.test ? "test" : "prod"
        }
      });
    }
    this.commands = new Map;
    this.slashCommands = new Map;
    this.users = new Map;
    this.menubtn = "commands";
    this.client.on("message", message => {
      if (message.message.successful_payment) {
        return this.emit("paymentSuccess", new Payment(message, this));
      }
      message = new Message(message, this);
      if (!message.content) {
        return;
      }
      var args = message.content.split(" ");
      var cmd = args.shift();
      var command = this.slashCommands.get(cmd) || this.commands.get(cmd);
      if (command) {
        try {
          command.execute({
            message,
            command,
            args,
            "bot": this
          });
        } catch(e) {
          console.log(e);
        }
      }
      this.emit("message", message);
    });
    this.client.on("callback_query", interaction => {
      this.emit("interaction", new Interaction(interaction, this));
    });
    this.client.on("pre_checkout_query", payment => {
      this.emit("paymentProgress", new PaymentInProgress(payment, this));
    });
  }
  command(basic, executor) {
    if (typeof basic === "string") {
      basic = {
        "name": basic
      };
    }
    this.commands.set(basic.name, Object.assign(basic, {
      "execute": executor
    }));
    return this;
  }
  slashCommand(basic, executor) {
    if (!basic.name.startsWith("/")) {
      throw new Error("Slash command starts with /.");
    }
    this.slashCommands.set(basic.name, Object.assign(basic, {
      "execute": executor
    }));
    return this;
  }
  menuButton(target, label, link) {
    this.menubtn = { target, label, link };
    return this;
  }
  run() {
    this.client.start().catch(err => {
      if (this.options.debug) {
        console.log(err);
      }
    });
    var commands = [];
    for (var cmd of this.slashCommands.values()) {
      commands.push({
        "command": cmd.name.replace("/", ""),
        "description": cmd.description
      });
    }
    this.client.api.setMyCommands(commands);
    if (this.menubtn.target == "web") {
      this.client.api.setChatMenuButton({
        "menuButton": JSON.stringify({
          "type": "web_app",
          "text": this.menubtn.label,
          "web_app": {
            "url": this.menubtn.link
          }
        })
      });
    } else {
      this.client.api.setChatMenuButton({
        "menuButton": JSON.stringify({
          "type": "commands"
        })
      });
    }
    return this;
  }
  parseInitData(qs) {
    if (typeof qs !== "string") {
      return !1;
    }
    var dcs = decodeURIComponent(qs).split("&").sort();
    var hash = dcs.find(a => a.startsWith("hash="));
    if (!hash) {
      return !1;
    }
    hash = hash.split("=")[1];
    dcs = dcs.filter(a => !a.startsWith("hash=")).join("\n");
    var secretKey = crypto.createHmac("sha256", "WebAppData").update(this.options.token).digest();
    var checkHash = crypto.createHmac("sha256", secretKey).update(dcs).digest("hex");
    return (checkHash === hash ? new User(JSON.parse(dcs.split("\n").find(a => a.startsWith("user=")).split("=")[1]), this) : null);
  }
  async stop() {
    await this.client.stop();
    this.emit("stopped");
  }
}

class Channel {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.typingLoop = null;
  }
  get id() {
    return this.data.id;
  }
  async type() {
    await this.bot.client.api.sendChatAction(this.id, "typing");
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
    if (data instanceof MessageBuilder) {
      data = data.data;
    }
    if (data.media && data.media.length) {
      if (data.media[0].type == "animation") {
        await this.bot.client.api.sendAnimation(this.id, data.media[0].url, Object.assign({
          "reply_parameters": data.replyParameters ? {
            "message_id": data.replyParameters.message.id,
            "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
            "allow_sending_without_reply": !1
          } : void 0,
          "reply_markup": data.replyMarkup ? data.replyMarkup : {
            "remove_keyboard": !0
          },
          "caption": data.content,
          "parse_mode": data.parseMode,
          "show_caption_above_media": data.textAbove
        }, data.extra));
      } else {
        await this.bot.client.api.sendMediaGroup(this.id, data.media.map((media, index) => {
          if (index < 1) {
            return {
              "type": (media.type == "image") ? "photo" : media.type,
              "media": media.url,
              "caption": data.content,
              "parse_mode": data.parseMode,
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
          },
          "parse_mode": data.parseMode
        }, data.extra));
      }
    } else {
      await this.bot.client.api.sendMessage(this.id, data.content, Object.assign({
        "reply_parameters": data.replyParameters ? {
          "message_id": data.replyParameters.message.id,
          "chat_id": (data.replyParameters.channel ? data.replyParameters.channel.id : this.id),
          "allow_sending_without_reply": !1
        } : void 0,
        "reply_markup": data.replyMarkup ? data.replyMarkup : {
          "remove_keyboard": !0
        },
        "parse_mode": data.parseMode
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
    if (data instanceof MessageBuilder) {
      data = data.data;
    }
    await this.bot.client.api.sendInvoice(this.id, {
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
}

class File {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.path = null;
  }
  get id() {
    return this.data.file_id;
  }
  get link() {
    if (this.path) {
      return `${this.bot ? this.bot.api : "https://api.telegram.org"}/file/bot${this.bot.options.token}/${this.path}`;
    } else {
      return new Promise(res => {
        this.bot.client.api.getFile(this.id).then(result => {
          this.path = result.file_path;
          res(this.link);
        });
      });
    }
  }
}

class Interaction {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
    this.message = new Message(this._data.callbackQuery.message, bot);
  }
  get id() {
    return this._data.callbackQuery.id;
  }
  get data() {
    return this._data.callbackQuery.data;
  }
  async notify(text) {
    await this.bot.client.api.answerCbQuery(this.id, text);
  }
  async modal(text) {
    await this.bot.client.api.answerCbQuery(this.id, text, {
      "show_alert": !0
    });
  }
}

class Message {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.channel = new Channel(this.data.chat, bot);
    this.user = this.bot.users.get(this.data.from.id) || new User(this.data.from, bot);
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
    if (data instanceof MessageBuilder) {
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
}

class MessageBuilder {
  constructor() {
    this.data = {};
  }
  clear() {
    delete this.data.content;
    delete this.data.replyMarkup;
    delete this.data.invoiceExtra;
    return this;
  }
  text(data) {
    if (!this.data.content) {
      this.data.content = data;
    } else {
      this.data.content += ` ${data}`;
    }
    return this;
  }
  buttons(rows) {
    this.data.replyMarkup = {
      "inline_keyboard": rows.map(row => row.map(btn => {
        switch(btn.type) {
          case "web":
            return {
              "text": btn.label,
              "url": btn.link
            };
            break;
          case "webapp":
            return {
              "text": btn.label,
              "web_app": {
                "url": btn.link
              }
            };
            break;
          case "interaction":
            return {
              "text": btn.label,
              "callback_data": btn.data
            };
            break;
          case "payment":
            return {
              "text": btn.label,
              "pay": !0
            };
            break;
          default:
            break;
        }
      }).filter(btn => btn))
    };
    return this;
  }
  keyboard(rows) {
    this.data.replyMarkup = {
      "keyboard": rows.map(row => row.map(btn => {
        switch(btn.type) {
          case "answer":
            return {
              "text": btn.label
            };
            break;
          case "webapp":
            return {
              "text": btn.label,
              "web_app": {
                "url": btn.link
              }
            };
            break;
          default:
            break;
        }
      }).filter(btn => btn))
    };
    return this;
  }
  payment(data) {
    this.data.invoiceExtra = {
      "title": data.title,
      "description": data.description,
      "payload": data.data,
      "currency": "XTR",
      "prices": [{
        "label": data.item,
        "amount": data.price
      }]
    };
    return this;
  }
}

class Payment {
  constructor(data, bot) {
    this._data = data;
    this.bot = bot;
    this.channel = new Channel(this._data.chat, bot);
    this.user = this.bot.users.get(this._data.from.id) || new User(this._data.from, bot);
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
}

class PaymentInProgress {
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
    await this.bot.client.api.answerPreCheckoutQuery(this.id, !0);
  }
  async decline(text) {
    await this.bot.client.api.answerPreCheckoutQuery(this.id, !1, text);
  }
}

class User {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
  }
  get id() {
    return this.data.id;
  }
  get isBot() {
    return this.data.is_bot;
  }
  get firstName() {
    return this.data.first_name;
  }
  get lastName() {
    return this.data.last_name;
  }
  get username() {
    return this.data.username;
  }
  get language() {
    return this.data.language_code;
  }
  get avatars() {
    return new Promise(res => {
      this.bot.client.api.getUserProfilePhotos(this.id).then(result => res(result.photos.map(row => row.map(photo => new File(photo, this.bot)))));
    });
  }
}


module.exports = { Bot, Channel, File, Interaction, Message, MessageBuilder, Payment, PaymentInProgress, User };
