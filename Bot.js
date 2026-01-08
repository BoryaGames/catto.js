var nacl = require("tweetnacl");
var events = require("events");
var Discord = require("discord.js");
var djsws = require("@discordjs/ws");
var { ClusterManager, ClusterClient, getInfo, ReClusterManager } = require("discord-hybrid-sharding");
var fs = require("fs");
var path = require("path");
var User = require("./User");
var MessageBuilder = require("./MessageBuilder");
var Base64 = require("./Base64");
if (typeof EventEmitter === "undefined") {
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
      "buttonListener": !0,
      "publicKey": "",
      "debug": !1,
      "mobile": !1,
      "sharded": !1,
      "partials": !1,
      "messageDeleteExecutor": !1,
      "auditIndexation": !1,
      "auditFile": null
    }, options || {});
    if (client) {
      this.client = client;
    } else {
      djsws.DefaultWebSocketManagerOptions.identifyProperties.device = "catto.js";
      if (this.options.mobile) {
        djsws.DefaultWebSocketManagerOptions.identifyProperties.browser = "Discord Android";
      } else {
        djsws.DefaultWebSocketManagerOptions.identifyProperties.browser = "catto.js";
      }
      var opts = {
        "intents": new Discord.IntentsBitField(this.options.intents),
        "rest": {
          "version": this.options.apiv
        }
      };
      if (this.options.partials) {
        opts.partials = [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.GuildScheduledEvent, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.ThreadMember, Discord.Partials.User];
      }
      if (this.options.sharded) {
        opts.shards = getInfo().SHARD_LIST;
        opts.shardCount = getInfo().TOTAL_SHARDS;
      }
      this.client = new Discord.Client(opts);
      if (this.options.sharded) {
        this.client.cluster = new ClusterClient(this.client);
      }
    }
    this.currentStatus = void 0;
    this.buttons = new Map();
    this.commands = new Map();
    this.slashCommands = new Map();
    this.userContexts = new Map();
    this.messageContexts = new Map();
    if (this.options.debug) {
      this.client.on("debug", console.log);
    }
    this.client.on("clientReady", async () => {
      if (this.options.sharded) {
        this.client.cluster.triggerReady();
      }
      var gcmds = [];
      var scmds = [];
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
              if (opt.min) {
                option.setMinLength(opt.min);
              }
              if (opt.max) {
                option.setMaxLength(opt.max);
              }
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
              if (opt.types) {
                option.addChannelTypes(...opt.types);
              }
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
        var integration_types = [0];
        if (cmd.user) {
          integration_types.push(1);
        }
        var contexts = [0];
        if (cmd.dm) {
          contexts.push(1);
        }
        if (cmd.user) {
          contexts.push(2);
        }
        if (cmd.servers) {
          cmd.servers.forEach(id => {
            if (!scmds[id]) {
              scmds[id] = [];
            }
            scmds[id].push(Object.assign(cmdo.toJSON(), {
              integration_types, contexts
            }));
          });
        } else {
          gcmds.push(Object.assign(cmdo.toJSON(), {
            integration_types, contexts
          }));
        }
      }
      for (var cmd of this.userContexts.values()) {
        var cmdo = new Discord.ContextMenuCommandBuilder();
        cmdo.setType(2).setName(cmd.name).setDMPermission(cmd.dm);
        if (cmd.servers) {
          cmd.servers.forEach(id => {
            if (!scmds[id]) {
              scmds[id] = [];
            }
            scmds[id].push(Object.assign(cmdo.toJSON(), {
              "integration_types": [0, 1].slice(0, (cmd.user ? 2 : 1)),
              "contexts": [0, 1, 2].slice(0, (cmd.user ? 3 : 2)),
            }));
          });
        } else {
          gcmds.push(Object.assign(cmdo.toJSON(), {
            "integration_types": [0, 1].slice(0, (cmd.user ? 2 : 1)),
            "contexts": [0, 1, 2].slice(0, (cmd.user ? 3 : 2)),
          }));
        }
      }
      for (var cmd of this.messageContexts.values()) {
        var cmdo = new Discord.ContextMenuCommandBuilder();
        cmdo.setType(3).setName(cmd.name).setDMPermission(cmd.dm);
        if (cmd.servers) {
          cmd.servers.forEach(id => {
            if (!scmds[id]) {
              scmds[id] = [];
            }
            scmds[id].push(Object.assign(cmdo.toJSON(), {
              "integration_types": [0, 1].slice(0, (cmd.user ? 2 : 1)),
              "contexts": [0, 1, 2].slice(0, (cmd.user ? 3 : 2)),
            }));
          });
        } else {
          gcmds.push(Object.assign(cmdo.toJSON(), {
            "integration_types": [0, 1].slice(0, (cmd.user ? 2 : 1)),
            "contexts": [0, 1, 2].slice(0, (cmd.user ? 3 : 2)),
          }));
        }
      }
      if (this.options.slashListener) {
        var entryPoint = (await this.client.rest.get(`/applications/${this.client.application.id}/commands`)).find(slash => slash.type == 4);
        if (entryPoint) {
          gcmds.unshift(entryPoint);
        }
        this.client.rest.put(`/applications/${this.client.application.id}/commands`, {
          "body": gcmds
        });
        Object.keys(scmds).forEach(id => {
          this.client.rest.put(`/applications/${this.client.application.id}/guilds/${id}/commands`, {
            "body": scmds[id]
          });
        });
      }
      if (this.options.auditIndexation) {
        this.auditDatabase = {};
        for (var server of this.servers) {
          if (!server.members.me.permissions.has(Discord.PermissionsBitField.Flags.VIEW_AUDIT_LOG)) {
            continue;
          }
          try {
            var fetchedLogs = (await server.fetchAuditLogs({
              "limit": 100,
              "type": 72
            })).entries.filter(log => log.targetType == "Message");
            for (var log of fetchedLogs.values()) {
              this.auditDatabase[log.id] = log.extra.count;
            }
          } catch {}
        }
        if (this.options.auditFile) {
          fs.writeFileSync(this.options.auditFile.replace("%", this.cluster ? this.cluster.id.toString() : "0"), JSON.stringify(this.auditDatabase, null, 2));
        }
      }
      this.emit("running", { Discord });
      if (this.cluster && this.cluster.id == (this.cluster.count - 1)) {
        this.cluster.broadcastEval(client => client.emit("_runningFull"));
        this.emit("runningFullLast", { Discord });
      }
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
    this.client.on("messageDelete", async message => {
      if (message.author && !(message.author instanceof User)) {
        message.author = new User(message.author, this);
      }
      if (message.member && message.member.user && !(message.member.user instanceof User)) {
        message.member.user = new User(message.member.user, this);
      }
      if (!this.options.messageDeleteExecutor) {
        return this.emit("messageDeleted", message);
      }
      if (!message.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.VIEW_AUDIT_LOG)) {
        return this.emit("messageDeleted", message);
      }
      try {
        var fetchedLogs = (await message.guild.fetchAuditLogs({
          "limit": 100,
          "type": 72
        })).entries.filter(log => log.targetType == "Message");
      } catch {
        return this.emit("messageDeleted", message);
      }
      var found = !1;
      for (var log of fetchedLogs.values()) {
        if (log.targetId != message.author.id || log.extra.channel.id != message.channel.id) {
          continue;
        }
        if (this.auditDatabase[log.id] !== log.extra.count) {
          if (!found) {
            found = true;
            message.deletedBy = new User(log.executor, this);
            message.deletedById = log.executorId;
          }
          this.auditDatabase[log.id] = log.extra.count;
        }
      }
      if (this.options.auditFile) {
        fs.writeFileSync(this.options.auditFile.replace("%", this.cluster ? this.cluster.id.toString() : "0"), JSON.stringify(this.auditDatabase, null, 2));
      }
      if (!found) {
        message.deletedBy = message.author;
        message.deletedById = message.author.id;
      }
      this.emit("messageDeleted", message);
    });
    this.client.on("guildCreate", guild => {
      this.emit("botAdd", guild);
    });
    this.client.on("guildDelete", guild => {
      this.emit("botDelete", guild);
    });
    this.auditDatabase = {};
    if (this.options.auditFile) {
      if (!fs.existsSync(this.options.auditFile.replace("%", this.cluster ? this.cluster.id.toString() : "0"))) {
        fs.writeFileSync(this.options.auditFile.replace("%", this.cluster ? this.cluster.id.toString() : "0"), "{}");
      }
      this.auditDatabase = JSON.parse(fs.readFileSync(this.options.auditFile.replace("%", this.cluster ? this.cluster.id.toString() : "0")).toString("utf-8"));
    }
  }
  get cluster() {
    return this.client.cluster;
  }
  get servers() {
    var r = Array.from(this.client.guilds.cache.values());
    r.count = r.length;
    if (this.options.sharded) {
      return new Promise(async res => {
        r.count = (await this.cluster.broadcastEval("this.guilds.cache.size")).reduce((a, b) => a + b, 0);
        res(r);
      });
    }
    return r;
  }
  get channels() {
    var r = Array.from(this.client.channels.cache.values());
    r.count = r.length;
    if (this.options.sharded) {
      return new Promise(async res => {
        r.count = (await this.cluster.broadcastEval("this.channels.cache.size")).reduce((a, b) => a + b, 0);
        res(r);
      });
    }
    return r;
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
  userContext(basic, executor) {
    if (typeof basic === "string") {
      basic = {
        "name": basic
      };
    }
    this.userContexts.set(basic.name, Object.assign(basic, {
      "execute": executor
    }));
    return this;
  }
  messageContext(basic, executor) {
    if (typeof basic === "string") {
      basic = {
        "name": basic
      };
    }
    this.messageContexts.set(basic.name, Object.assign(basic, {
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
  runAsync() {
    return this.client.login(this.options.token);
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
          this.client.actions.InteractionCreate.handle(req.body);
        }
      } else {
        res.status(401).end("Invalid request signature.");
      }
    }
  }
  handleInteractionCreate(interaction) {
    interaction.user = new User(interaction.user, this);
    if (interaction.member) {
      interaction.member.user = new User(interaction.member.user, this);
    }
    var realReply = interaction.reply;
    var realDeferReply = interaction.deferReply;
    var realEditReply = interaction.editReply;
    interaction.reply = function(options) {
      if (typeof options === "object" && "ephemeral" in options) {
        if (options.ephemeral) {
          options.flags = (options.flags || 0) | Discord.MessageFlags.Ephemeral;
        }
        delete options.ephemeral;
      }
      return realReply.apply(this, [options]);
    };
    interaction.deferReply = function(options) {
      if (typeof options === "object" && "ephemeral" in options) {
        if (options.ephemeral) {
          options.flags = (options.flags || 0) | Discord.MessageFlags.Ephemeral;
        }
        delete options.ephemeral;
      }
      return realDeferReply.apply(this, [options]);
    };
    interaction.editReply = function(options) {
      if (typeof options === "object" && "ephemeral" in options) {
        if (options.ephemeral) {
          options.flags = (options.flags || 0) | Discord.MessageFlags.Ephemeral;
        }
        delete options.ephemeral;
      }
      return realEditReply.apply(this, [options]);
    };
    if (this.options.slashListener && interaction.isChatInputCommand()) {
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
    } else if (this.options.slashListener && interaction.isUserContextMenuCommand()) {
      var command = this.userContexts.get(interaction.commandName);
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
    } else if (this.options.slashListener && interaction.isMessageContextMenuCommand()) {
      var command = this.messageContexts.get(interaction.commandName);
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
    } else if (this.options.buttonListener && interaction.isButton()) {
      var button = this.buttons.get(interaction.customId);
      if (button) {
        try {
          button.execute({
            Discord,
            User,
            MessageBuilder,
            interaction,
            button,
            "args": button.args,
            "bot": this
          });
        } catch(e) {
          console.log(e);
        }
      } else {
        interaction.deferUpdate({}).catch(() => {});
      }
    } else {
      this.emit("interaction", interaction);
    }
  }
  setStatus(data) {
    this.currentStatus = data;
    this.client.options.presence = data;
    return this.client.user.setPresence(data);
  }
  static shard(file, token, type, compression) {
    var manager = new ClusterManager(path.join(__dirname, "..", "..", file), {
      "shardsPerClusters": compression,
      "mode": (["worker", "process"][type - 1] || "worker"),
      token
    });
    manager.extend(new ReClusterManager());
    manager.spawn({
      "timeout": -1
    });
    return manager;
  }
};
