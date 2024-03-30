var events = require("events");
var Telegram = require("node-telegram-bot-api");
var TelegramMessage = require("./TelegramMessage");
if (typeof EventEmitter === "undefined") {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {
  constructor(options, client) {
    super();
    this.options = Object.assign({
      "speed": 300,
      "token": "",
      "debug": !1
    }, options || {});
    if (client) {
      this.client = client;
    } else {
      this.client = new Telegram(this.options.token, {
        "polling": {
          "interval": this.options.speed,
          "autoStart": !1
        }
      });
    }
    this.commands = new Map();
    this.slashCommands = new Map();
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
  async run() {
    await this.client.startPolling();
    var commands = [];
    for (var cmd of this.slashCommands.values()) {
      commands.push({
        "command": cmd.name.replace("/", ""),
        "description": cmd.description
      });
    }
    this.client.setMyCommands(commands);
    if (this.menubtn.target == "web") {
      this.client.setChatMenuButton({
        "menu_button": JSON.stringify({
          "type": "web_app",
          "text": this.menubtn.label,
          "web_app": {
            "url": this.menubtn.link
          }
        })
      });
    } else {
      this.client.setChatMenuButton({
        "menu_button": JSON.stringify({
          "type": "commands"
        })
      });
    }
    return this;
  }
  async stop() {
    await this.client.stopPolling();
    return this;
  }
};
