var nacl = require("tweetnacl");
var events = require("events");
var Discord = require("discord.js");
var User = require("./User");
var MessageBuilder = require("./MessageBuilder");
if (typeof EventEmitter !== "undefined") {} else {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {
  constructor(options, client) {
    super();
    this.options = Object.assign({
      "token": "",
      "intents": 98045,
      "apiv": 10,
      "slashListener": !0,
      "publicKey": ""
    }, options || {});
    if (client) {
      this.client = client;
    } else {
      this.client = new Discord.Client({
        "intents": new Discord.IntentsBitField(this.options.intents),
        "rest": {
          "version": this.options.apiv
        },
        "ws": {
          "properties": (this.options.mobile ? {
            "browser": "Discord Android"
          } : {})
        }
      });
    }
    this.buttons = new Map();
    this.commands = new Map();
    this.slashCommands = new Map();
    this.client.on("ready", () => {
      var cmds = [];
      for (var cmd of this.slashCommands.values()) {
        var cmdo = new Discord.SlashCommandBuilder();
        cmdo.setName(cmd.name).setDescription(cmd.description).setDMPermission(cmd.dm);
        for (var opt of cmd.options) {
          switch(opt.type) {
            case "string":
              var option = new Discord.SlashCommandStringOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              if (opt.choices) {
                option.setChoices(...opt.choices);
              }
              cmdo.addStringOption(option);
              break;
            case "integer":
              var option = new Discord.SlashCommandIntegerOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              option.setMinValue(opt.min);
              option.setMaxValue(opt.max);
              if (opt.choices) {
                option.setChoices(...opt.choices);
              }
              cmdo.addIntegerOption(option);
              break;
            case "bool":
              var option = new Discord.SlashCommandBooleanOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addBooleanOption(option);
              break;
            case "user":
              var option = new Discord.SlashCommandUserOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addUserOption(option);
              break;
            case "channel":
              var option = new Discord.SlashCommandChannelOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addChannelOption(option);
              break;
            case "role":
              var option = new Discord.SlashCommandRoleOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addRoleOption(option);
              break;
            case "file":
              var option = new Discord.SlashCommandAttachmentOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addAttachmentOption(option);
              break;
            case "number":
              var option = new Discord.SlashCommandNumberOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              option.setMinValue(opt.min);
              option.setMaxValue(opt.max);
              if (opt.choices) {
                option.setChoices(...opt.choices);
              }
              cmdo.addNumberOption(option);
              break;
            case "mentionable":
              var option = new Discord.SlashCommandMentionableOption();
              option.setName(opt.name);
              option.setDescription(opt.description);
              option.setRequired(opt.required);
              cmdo.addMentionableOption(option);
              break;
            default:
              break;
          }
        }
        cmds.push(cmdo);
      }
      if (this.options.slashListener) {
        this.client.application.commands.set(cmds);
      }
      this.emit("running");
    });
    this.client.on("interactionCreate", this.handleInteractionCreate.bind(this));
    this.client.on("messageCreate", message => {
      message.author = new User(message.author, this);
      if (message.member) {
        message.member.user = new User(message.member.user, this);
      }
      var args = message.content.split(" ");
      var cmd = args.shift();
      var command = this.commands.get(cmd);
      if (command) {
        try {
          command.execute({
            Discord,
            User,
            MessageBuilder,
            message,
            cmd,
            args,
            "bot": this
          });
        } catch(e) {
          console.log(e);
        }
      }
      this.emit("message", message);
    });
    this.client.on("guildCreate", guild => {
      this.emit("botAdd", guild);
    });
    this.client.on("guildDelete", guild => {
      this.emit("botDelete", guild);
    });
  }
  slashCommand(basic, options, executor) {
    if (!basic.name.startsWith("/")) {
      throw new Error("Slash command starts with /.");
    }
    if (typeof options === "function") {
      executor = options;
      options = [];
    }
    basic.name = basic.name.substring(1);
    this.slashCommands.set(basic.name, Object.assign(basic, {
      "options": options,
      "execute": executor
    }));
    return this;
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
  run() {
    this.client.login(this.options.token);
    return this;
  }
  stop() {
    this.client.destroy().then(() => {
      this.emit("stopped");
    });
    return this;
  }
  handleWebInteraction(req, res) {
    if (req.body) {
      var signature = req.get("X-Signature-Ed25519");
      var timestamp = req.get("X-Signature-Timestamp");
      var body = JSON.stringify(req.body);
      var isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, "hex"),
        Buffer.from(this.options.publicKey, "hex")
      );
      if (isVerified) {
        if (req.body.type == 1) {
          res.json({
            "type": 1
          });
        } else {
          var interaction = new Discord.BaseInteraction(this.client, req.body);
          if (interaction.isCommand()) {
            interaction = new Discord.CommandInteraction(this.client, req.body);
            if (interaction.isChatInputCommand()) {
              interaction = new Discord.ChatInputCommandInteraction(this.client, req.body);
            }
          } else if (interaction.isButton()) {
            interaction = new Discord.ButtonInteraction(this.client, req.body);
          }
          interaction.reply = async options => {
            if (this.deferred || this.replied) {
              throw new Error("Already deferred or replied.");
	    }
            if (options.ephemeral !== null && options.ephemeral !== undefined) {
              this.ephemeral = options.ephemeral;
	    } else {
              this.ephemeral = !1;
            }
            var messagePayload = null;
            if (options instanceof Discord.MessagePayload) {
              messagePayload = options;
            } else {
              messagePayload = Discord.MessagePayload.create(this, options);
            }
            var { body: data, files } = await messagePayload.resolveBody().resolveFiles();
            res.json({
              "type": 4,
              data
            });
            this.replied = !0;
          }
          this.handleInteractionCreate(interaction);
        }
      } else {
        res.status(401).end("Invalid request signature.");
      }
    }
  }
  handleInteractionCreate(interaction) {
    if (interaction.isChatInputCommand()) {
      interaction.user = new User(interaction.user, this);
      if (interaction.member) {
        interaction.member.user = new User(interaction.member.user, this);
      }
      var command = this.slashCommands.get(interaction.commandName);
      if (command) {
        try {
          command.execute({
            Discord,
            User,
            MessageBuilder,
            interaction,
            "cmd": command.name,
            "bot": this
          });
        } catch(e) {
          console.log(e);
        }
      } else {
        interaction.reply({}).catch(() => {});
      }
    }
    if (interaction.isButton()) {
      interaction.user = new User(interaction.user, this);
      if (interaction.member) {
        interaction.member.user = new User(interaction.member.user, this);
      }
      var button = this.buttons.get(interaction.customId);
      if (button) {
        try {
          button({
            Discord,
            User,
            MessageBuilder,
            interaction,
            "bot": this
          });
        } catch(e) {
          console.log(e);
        }
      } else {
        interaction.reply({}).catch(() => {});
      }
    }
  }
};
