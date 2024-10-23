var events = require("events");
var crypto = require("crypto");
var Telegraf = null;
var TelegramMessage = require("./TelegramMessage");
var TelegramInteraction = require("./TelegramInteraction");
var TelegramUser = require("./TelegramUser");
if (typeof EventEmitter === "undefined") {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {
  constructor(options, client) {
    super();
    this.options = Object.assign({
      "token": "",
      "debug": !1,
      "test": !1
    }, options || {});
    if (client) {
      this.client = client;
    } else {
      Telegraf = require("telegraf").Telegraf;
      this.client = new Telegraf(this.options.token, {
        "testEnv": this.options.test
      });
    }
    this.commands = new Map();
    this.slashCommands = new Map();
    this.users = new Map();
    this.menubtn = "commands";
    if (this.options.debug) {
      this.client.on("polling_error", console.log);
      this.client.on("webhook_error", console.log);
      this.client.on("error", console.log);
    } else {
      this.client.on("polling_error", () => {});
      this.client.on("webhook_error", () => {});
    }
    this.client.on("message", message => {
      message = new TelegramMessage(message, this);
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
      this.emit("interaction", new TelegramInteraction(interaction, this));
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
    this.client.launch();
    var commands = [];
    for (var cmd of this.slashCommands.values()) {
      commands.push({
        "command": cmd.name.replace("/", ""),
        "description": cmd.description
      });
    }
    this.client.telegram.setMyCommands(commands);
    if (this.menubtn.target == "web") {
      this.client.telegram.setChatMenuButton({
        "menuButton": JSON.stringify({
          "type": "web_app",
          "text": this.menubtn.label,
          "web_app": {
            "url": this.menubtn.link
          }
        })
      });
    } else {
      this.client.telegram.setChatMenuButton({
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
    return (checkHash === hash ? new TelegramUser(JSON.parse(dcs.split("\n").find(a => a.startsWith("user=")).split("=")[1]), this) : null);
  }
  stop() {
    this.client.bot("SIGINT");
    return this;
  }
};
