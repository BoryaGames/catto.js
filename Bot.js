var events = require("events");
var Discord = require("discord.js");
var User = require("./User");
if (typeof EventEmitter !== "undefined") {} else {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign({
      "token": "",
      "intents": 98045
    }, options || {});
    this.client = new Discord.Client({
      "intents": new Discord.IntentsBitField(this.options.intents)
    });
    this.commands = new Map();
    this.client.on("ready", () => {
      var cmds = [];
      for (var cmd of this.commands.values()) {
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
              option.setRequired(opt.req);
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
      this.client.application.commands.set(cmds);
      this.emit("running");
    });
    this.client.on("interactionCreate", interaction => {
      if (interaction.isChatInputCommand()) {
        var command = this.commands.get(interaction.commandName);
        if (command) {
          try {
            command.execute({
              Discord,
              interaction,
              "bot": this
            });
          } catch(e) {
            console.error(e);
          }
        }
      }
    });
    this.client.on("messageCreate", message => {
      message.author = new User(message.author);
      if (message.member) {
        message.member.user = new User(message.member.user);
      }
      this.emit("message", message);
    });
    this.client.on("guildCreate", guild => {
      this.emit("botAdd", guild);
    });
    this.client.on("guildRemove", guild => {
      this.emit("botRemove", guild);
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
    this.commands.set(basic.name, Object.assign(basic, {
      "options": options,
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
};
