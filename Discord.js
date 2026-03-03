var nacl = require("tweetnacl");
var events = require("events");
var Discord = null;
var djsws = null;
var hybrid = null;
var fs = require("fs");
var path = require("path");
var Bitfield = require("./Bitfield");

if (typeof EventEmitter === "undefined") {
  var { EventEmitter } = events;
}

class Bot extends EventEmitter {
  constructor(options, client) {
    super();
    this.options = Object.assign({
      "token": "",
      "intents": 98045,
      "api": "https://discord.com/api",
      "cdn": "https://cdn.discordapp.com",
      "apiv": 10,
      "gatewayv": 10,
      "slashListener": !0,
      "buttonListener": !0,
      "publicKey": "",
      "debug": !1,
      "mobile": !1,
      "sharded": !1,
      "partials": !1,
      "detectExecutors": !1,
      "messageDeleteExecutor": !1,
      "auditIndexation": !1,
      "auditFile": null,
      "readyWithoutApplication": false
    }, options || {});
    try {
      Discord = Discord || require("discord.js");
      djsws = djsws || require("@discordjs/ws");
      hybrid = hybrid || require("discord-hybrid-sharding");
    } catch(_) {
      throw "Failed to activate Discord support.";
    }
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
          "api": this.options.api,
          "cdn": this.options.cdn,
          "version": this.options.apiv.toString()
        },
        "ws": {
          "version": this.options.gatewayv.toString()
        }
      };
      if (this.options.partials) {
        opts.partials = [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.GuildScheduledEvent, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.ThreadMember, Discord.Partials.User];
      }
      if (this.options.sharded) {
        opts.shards = hybrid.getInfo().SHARD_LIST;
        opts.shardCount = hybrid.getInfo().TOTAL_SHARDS;
      }
      this.client = new Discord.Client(opts);
      if (this.options.readyWithoutApplication) {
        this.client.application = {
          "_patch": () => {}
        };
      }
      if (this.options.sharded) {
        this.client.cluster = new hybrid.ClusterClient(this.client);
      }
    }
    this.currentStatus = undefined;
    this.buttons = new Map;
    this.commands = new Map;
    this.slashCommands = new Map;
    this.userContexts = new Map;
    this.messageContexts = new Map;
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
        for (var server of this.client.guilds.cache.values()) {
          if (!server.members.me.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)) {
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
          } catch(_) {}
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
      if (!message.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)) {
        return this.emit("messageDeleted", message);
      }
      try {
        var fetchedLogs = (await message.guild.fetchAuditLogs({
          "limit": 100,
          "type": 72
        })).entries.filter(log => log.targetType == "Message");
      } catch(_) {
        return this.emit("messageDeleted", message);
      }
      var found = !1;
      for (var log of fetchedLogs.values()) {
        if (!message.author || !message.channel || log.targetId != message.author.id || log.extra.channel.id != message.channel.id) {
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
    function addExecutor(bot, event, event2, prop, type) {
      bot.client.on(event, async element => {
        if (!bot.options.detectExecutors) {
          return bot.emit(event2, element);
        }
        if (!element.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)) {
          return bot.emit(event2, element);
        }
        try {
          var fetchedLogs = (await element.guild.fetchAuditLogs({
            "limit": 100,
            type
          })).entries;
        } catch(_) {
          return bot.emit(event2, element);
        }
        for (var log of fetchedLogs.values()) {
          if (log.targetId == element.id) {
            element[prop] = new User(log.executor, bot);
            element[prop + "Id"] = log.executorId;
            break;
          }
        }
        bot.emit(event2, element);
      });
    }
    addExecutor(this, "channelCreate", "channelCreated", "createdBy", 10);
    addExecutor(this, "channelDelete", "channelDeleted", "deletedBy", 12);
    addExecutor(this, "roleCreate", "roleCreated", "createdBy", 30);
    addExecutor(this, "roleDelete", "roleDeleted", "deletedBy", 32);
    addExecutor(this, "emojiCreate", "emojiCreated", "createdBy", 60);
    addExecutor(this, "emojiDelete", "emojiDeleted", "deletedBy", 62);
    addExecutor(this, "stickerCreate", "stickerCreated", "createdBy", 90);
    addExecutor(this, "stickerDelete", "stickerDeleted", "deletedBy", 92);
    addExecutor(this, "threadCreate", "threadCreated", "createdBy", 110);
    addExecutor(this, "threadDelete", "threadDeleted", "deletedBy", 112);
    this.client.on("guildBanAdd", async ban => {
      ban.user = new User(ban.user, this);
      if (!this.options.detectExecutors) {
        return this.emit("memberBanned", ban);
      }
      if (!ban.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.ViewAuditLog)) {
        return this.emit("memberBanned", ban);
      }
      try {
        var fetchedLogs = (await ban.guild.fetchAuditLogs({
          "limit": 100,
          "type": 22
        })).entries;
      } catch(_) {
        return this.emit("memberBanned", ban);
      }
      for (var log of fetchedLogs.values()) {
        if (log.targetId == ban.user.id) {
          ban.bannedBy = new User(log.executor, this);
          ban.bannedById = log.executorId;
          break;
        }
      }
      this.emit("memberBanned", ban);
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
  get user() {
    return this.client.user ? new User(this.client.user, this) : null;
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
    try {
      Discord = Discord || require("discord.js");
      djsws = djsws || require("@discordjs/ws");
      hybrid = hybrid || require("discord-hybrid-sharding");
    } catch(_) {
      throw "Failed to activate Discord support.";
    }
    var manager = new hybrid.ClusterManager(path.join(__dirname, "..", "..", file), {
      "shardsPerClusters": compression,
      "mode": (["worker", "process"][type - 1] || "worker"),
      token
    });
    manager.extend(new hybrid.ReClusterManager);
    manager.spawn({
      "timeout": -1
    });
    return manager;
  }
}

class UserFlags extends Bitfield {
  constructor(value) {
    super(value, [
      "STAFF",
      "PARTNER",
      "HYPESQUAD",
      "BUG_HUNTER_LEVEL_1",
      "MFA_SMS",
      "PREMIUM_PROMO_DISMISSED",
      "HYPESQUAD_ONLINE_HOUSE_1",
      "HYPESQUAD_ONLINE_HOUSE_2",
      "HYPESQUAD_ONLINE_HOUSE_3",
      "PREMIUM_EARLY_SUPPORTER",
      "TEAM_PSEUDO_USER",
      "IS_HUBSPOT_CONTACT",
      "SYSTEM",
      "HAS_UNREAD_URGENT_MESSAGES",
      "BUG_HUNTER_LEVEL_2",
      "UNDERAGE_DELETED",
      "VERIFIED_BOT",
      "VERIFIED_DEVELOPER",
      "CERTIFIED_MODERATOR",
      "BOT_HTTP_INTERACTIONS",
      "SPAMMER",
      "DISABLE_PREMIUM",
      "ACTIVE_DEVELOPER",
      "PROVISIONAL_ACCOUNT",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "HIGH_GLOBAL_RATE_LIMIT",
      "DELETED",
      "DISABLED_SUSPICIOUS_ACTIVITY",
      "SELF_DELETED",
      "PREMIUM_DISCRIMINATOR",
      "USED_DESKTOP_CLIENT",
      "USED_WEB_CLIENT",
      "USED_MOBILE_CLIENT",
      "DISABLED",
      null,
      "HAS_SESSION_STARTED",
      "QUARANTINED",
      null,
      null,
      "PREMIUM_ELIGIBLE_FOR_UNIQUE_USERNAME",
      null,
      null,
      "COLLABORATOR",
      "RESTRICTED_COLLABORATOR"
    ]);
  }
}

class User {
  constructor(options, bot) {
    if (options instanceof User) {
      options = options.options;
    }
    if (options.global_name) {
      options.globalName = options.global_name;
    }
    if (options.public_flags) {
      options.publicFlags = options.public_flags;
    }
    if (options.banner_color) {
      options.bannerColor = options.banner_color;
    }
    if (options.accent_color) {
      options.accentColor = options.accent_color;
    }
    if (options.mfa_enabled) {
      options.mfaEnabled = options.mfa_enabled;
    }
    if (options.premium_type) {
      options.premiumType = options.premium_type;
    }
    if (options.avatar_decoration_data) {
      options.avatarDecorationData = options.avatar_decoration_data;
    }
    if (options.publicFlags && options.publicFlags.bitfield) {
      options.publicFlags = options.publicFlags.bitfield;
    }
    if (options.flags && options.flags.bitfield) {
      options.flags = options.flags.bitfield;
    }
    this.options = Object.assign({
      "id": "",
      "globalName": "",
      "username": "",
      "avatar": "",
      "discriminator": "",
      "publicFlags": 0,
      "flags": 0,
      "banner": "",
      "bannerColor": "",
      "accentColor": 0,
      "locale": "",
      "mfaEnabled": false,
      "premiumType": 0,
      "email": "",
      "verified": !1,
      "bot": false,
      "system": false,
      "avatarDecorationData": {}
    }, options || {});
    this.bot = bot;
  }
  get id() {
    return this.options.id;
  }
  get globalName() {
    return this.options.globalName;
  }
  get name() {
    return this.options.username;
  }
  get decorationHash() {
    return (this.options.avatarDecorationData ? this.options.avatarDecorationData.asset : null);
  }
  get decoration() {
    return `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/avatar-decoration-presets/${this.decorationHash}.png`;
  }
  get avatarHash() {
    return this.options.avatar;
  }
  get avatar() {
    var avataru = this.avatarHash;
    if (avataru && avataru.startsWith("a_")) {
      avataru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/avatars/${this.id}/${avataru}.gif?size=4096`;
    } else if (avataru) {
      avataru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/avatars/${this.id}/${avataru}.webp?size=4096`;
    } else if (this.discrim) {
      avataru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/embed/avatars/${(parseInt(this.discrim) % 5).toString()}.png`;
    } else {
      avataru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/embed/avatars/${(parseInt((BigInt(this.id) >> 22n).toString()) % 6).toString()}.png`;
    }
    return avataru;
  }
  get discrim() {
    return this.options.discriminator;
  }
  get tag() {
    return `${this.name}#${this.discrim}`;
  }
  get flags() {
    return new UserFlags(this.options.flags || this.options.publicFlags);
  }
  get badges() {
    return this.flags.all().filter(flag => [
      "STAFF",
      "PARTNER",
      "HYPESQUAD",
      "BUG_HUNTER_LEVEL_1",
      "HYPESQUAD_ONLINE_HOUSE_1",
      "HYPESQUAD_ONLINE_HOUSE_2",
      "HYPESQUAD_ONLINE_HOUSE_3",
      "PREMIUM_EARLY_SUPPORTER",
      "BUG_HUNTER_LEVEL_2",
      "VERIFIED_DEVELOPER",
      "CERTIFIED_MODERATOR",
      "BOT_HTTP_INTERACTIONS",
      "ACTIVE_DEVELOPER"
    ].includes(flag));
  }
  get bannerHash() {
    return this.options.banner;
  }
  get bannerColor() {
    return this.options.bannerColor;
  }
  get banner() {
    var banneru = this.bannerHash;
    if (banneru && banneru.startsWith("a_")) {
      banneru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/banners/${this.id}/${banneru}.gif?size=4096`;
    } else if (banneru) {
      banneru = `${this.bot ? this.bot.options.cdn : "https://cdn.discordapp.com"}/banners/${this.id}/${banneru}.webp?size=4096`;
    } else {
      banneru = this.bannerColor || this.accentColor;
    }
    return banneru;
  }
  get accentColor() {
    return this.options.accentColor;
  }
  get lang() {
    return this.options.locale;
  }
  get isRussian() {
    return (this.lang == "ru");
  }
  get is2FAEnabled() {
    return this.options.mfaEnabled;
  }
  get hasNitro() {
    return (this.isBot || this.options.premiumType > 0);
  }
  get hasNitroClassic() {
    return (this.options.premiumType == 1);
  }
  get hasNitroBoost() {
    return (this.isBot || this.options.premiumType == 2);
  }
  get hasNitroBasic() {
    return (this.options.premiumType == 3);
  }
  get email() {
    return this.options.email;
  }
  get isEmailVerified() {
    return this.options.verified;
  }
  get isBot() {
    return this.options.bot;
  }
  get isBotVerified() {
    return this.isBot && this.flags.has("VERIFIED_BOT");
  }
  get isBotHTTP() {
    return this.isBot && this.flags.has("BOT_HTTP_INTERACTIONS");
  }
  get isBotWS() {
    return this.isBot && !this.isBotHTTP;
  }
  get isSystem() {
    return this.options.system;
  }
  get isSpammer() {
    return this.flags.has("SPAMMER");
  }
  async requestApplication() {
    if (this.isBot) {
      this.application = new Application((await request.get({
        "url": `${this.bot ? this.bot.options.api : "https://discord.com/api"}/v${(this.bot ? (this.bot.client.rest.version ? this.bot.client.rest.version.toString() : "10") : "10")}/oauth2/applications/${this.id}/rpc`
      })).body);
    }
    return this.application;
  }
  toString() {
    return `<@${this.id}>`;
  }
}

class ApplicationFlags extends Bitfield {
  constructor(value) {
    super(value, [
      null,
      "EMBEDDED_RELEASED",
      "MANAGED_EMOJI",
      "EMBEDDED_IAP",
      "GROUP_DM_CREATE",
      "RPC_PRIVATE_BETA",
      "APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE",
      "GAME_PROFILE_DISABLED",
      "PUBLIC_OAUTH2_CLIENT",
      "CONTEXTLESS_ACTIVITY",
      "SOCIAL_LAYER_INTEGRATION_LIMITED",
      "RPC_HAS_CONNECTED",
      "GATEWAY_PRESENCE",
      "GATEWAY_PRESENCE_LIMITED",
      "GATEWAY_GUILD_MEMBERS",
      "GATEWAY_GUILD_MEMBERS_LIMITED",
      "VERIFICATION_PENDING_GUILD_LIMIT",
      "EMBEDDED",
      "GATEWAY_MESSAGE_CONTENT",
      "GATEWAY_MESSAGE_CONTENT_LIMITED",
      "EMBEDDED_FIRST_PARTY",
      "APPLICATION_COMMAND_MIGRATED",
      null,
      "APPLICATION_COMMAND_BADGE",
      "ACTIVE",
      "ACTIVE_GRACE_PERIOD",
      "IFRAME_MODAL",
      "SOCIAL_LAYER_INTEGRATION",
      null,
      "PROMOTED",
      "PARTNER"
    ]);
  }
}

class Application {
  constructor(options) {
    this.options = Object.assign({
      "id": "",
      "name": "",
      "icon": "",
      "description": "",
      "cover_image": "",
      "guild_id": "",
      "bot_public": !1,
      "bot_require_code_grant": !1,
      "terms_of_service_url": "",
      "privacy_policy_url": "",
      "install_params": null,
      "verify_key": "",
      "flags": 0,
      "tags": []
    }, options || {});
  }
  get id() {
    return this.options.id;
  }
  get name() {
    return this.options.name;
  }
  get iconHash() {
    return this.options.icon;
  }
  get description() {
    return this.options.description;
  }
  get coverImageHash() {
    return this.options.cover_image;
  }
  get server() {
    return this.options.guild_id;
  }
  get isPublic() {
    return this.options.bot_public;
  }
  get requireCodeGrant() {
    return this.options.bot_require_code_grant;
  }
  get TOS() {
    return this.options.terms_of_service_url;
  }
  get privacyPolicy() {
    return this.options.privacy_policy_url;
  }
  get installParams() {
    return this.options.install_params;
  }
  get verifyKey() {
    return this.options.verify_key;
  }
  get flags() {
    return new Bitfield(this.options.flags);
  }
  get badges() {
    return this.flags.all().filter(flag => [
      "APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE",
      "APPLICATION_COMMAND_BADGE"
    ].includes(flag));
  }
  get tags() {
    return this.options.tags;
  }
  get intents() {
    return this.flags.all().filter(flag => [
      "GATEWAY_PRESENCE",
      "GATEWAY_PRESENCE_LIMITED",
      "GATEWAY_GUILD_MEMBERS",
      "GATEWAY_GUILD_MEMBERS_LIMITED",
      "GATEWAY_MESSAGE_CONTENT",
      "GATEWAY_MESSAGE_CONTENT_LIMITED"
    ].includes(flag));
  }
  get cannotVerify() {
    return this.flags.has("VERIFICATION_PENDING_GUILD_LIMIT");
  }
  get canVerify() {
    return !this.cannotVerify;
  }
  get isEmbedded() {
    return this.flags.has("EMBEDDED");
  }
  get supportsSlash() {
    return this.flags.has("APPLICATION_COMMAND_BADGE");
  }
  get supportsAutomod() {
    return this.flags.has("APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE");
  }
};

class MessageBuilder {
  constructor(bot) {
    this.bot = bot;
    this.data = {};
  }
  clear() {
    delete this.data.content;
    delete this.data.embeds;
    delete this.data.components;
    return this;
  }
  text(t) {
    if (!this.data.content) {
      this.data.content = "";
    }
    this.data.content += t;
    return this;
  }
  link(text, link) {
    if (!this.data.content) {
      this.data.content = "";
    }
    this.data.content += `[${text}](${link})`;
    return this;
  }
  button(basic, execute) {
    var btn = new Discord.ButtonBuilder();
    if (!basic.id && !basic.url) {
      throw new Error("All buttons except URL must have ID.");
    }
    if (basic.id) {
      btn.setCustomId(basic.id);
    }
    if (basic.disabled) {
      btn.setDisabled(!0);
    } else {
      btn.setDisabled(!1);
    }
    if (basic.emoji) {
      btn.setEmoji(basic.emoji);
    }
    if (basic.text) {
      btn.setLabel(basic.text);
    }
    if (!basic.emoji && !basic.text) {
      throw new Error("Can't have an empty button.");
    }
    var colorlib = {
      "blue": "Primary",
      "gray": "Secondary",
      "lime": "Success",
      "red": "Danger"
    };
    basic.color = basic.color.toLowerCase();
    if (!colorlib[basic.color] && !basic.url) {
      throw new Error("Unknown color.");
    }
    if (basic.url) {
      btn.setStyle(Discord.ButtonStyle.Link);
      btn.setURL(basic.url);
    } else {
      btn.setStyle(Discord.ButtonStyle[colorlib[basic.color]]);
    }
    if (!this.data.components) {
      this.data.components = [];
    }
    if (basic.row) {
      if (!this.data.components[(basic.row - 1)]) {
        this.data.components[(basic.row - 1)] = new Discord.ActionRowBuilder();
      }
      this.data.components[(basic.row - 1)].addComponents(btn);
    } else {
      if (!this.data.components[0]) {
        this.data.components[0] = new Discord.ActionRowBuilder();
      }
      if (this.data.components[0].components.length < 5) {
        this.data.components[0].addComponents(btn);
      } else {
        if (!this.data.components[1]) {
          this.data.components[1] = new Discord.ActionRowBuilder();
        }
        if (this.data.components[1].components.length < 5) {
          this.data.components[1].addComponents(btn);
        } else {
          if (!this.data.components[2]) {
            this.data.components[2] = new Discord.ActionRowBuilder();
          }
          if (this.data.components[2].components.length < 5) {
            this.data.components[2].addComponents(btn);
          } else {
            if (!this.data.components[3]) {
              this.data.components[3] = new Discord.ActionRowBuilder();
            }
            if (this.data.components[3].components.length < 5) {
              this.data.components[3].addComponents(btn);
            } else {
              if (!this.data.components[4]) {
                this.data.components[4] = new Discord.ActionRowBuilder();
              }
              if (this.data.components[4].components.length < 5) {
                this.data.components[4].addComponents(btn);
              } else {
                throw new Error("Can't have more than 25 buttons in a single message.");
              }
            }
          }
        }
      }
    }
    if (!basic.url) {
      if (this.bot.buttons.get(basic.id)) {
        throw new Error("ID must be unique.");
      }
      this.bot.buttons.set(basic.id, Object.assign(basic, {
        execute
      }));
    }
    return this;
  }
  ephemeral() {
    this.data.ephemeral = true;
    return this;
  }
  notEphemeral() {
    this.data.ephemeral = false;
    return this;
  }
  embed(d) {
    if (!this.data.embeds) {
      this.data.embeds = [];
    }
    if (this.data.embeds.length < 10) {
      this.data.embeds.push(d);
      return this;
    } else {
      throw new Error("Message can't have more than 10 embeds.");
    }
  }
  file(d) {
    if (!this.data.files) {
      this.data.files = [];
    }
    this.data.files.push(d);
    return this;
  }
}

class AuthClient {
  constructor(options) {
    this.options = Object.assign({
      "server": null,
      "scopes": [],
      "id": "",
      "secret": "",
      "tokenType": "",
      "accessToken": "",
      "expires": new Date(0),
      "refreshToken": "",
      "apiv": 10,
      "redirectPath": ""
    }, options || {});
    this.user = null;
  }
  get available() {
    return (this.options.server && this.options.scopes.length > 0 && this.options.id && this.options.secret && this.options.tokenType && this.options.accessToken && this.options.expires && this.options.refreshToken && this.options.apiv && this.options.redirectPath
    );
  }
  get redirectUri() {
    return `http${((this.options.server.options.ssl || this.options.server.options.sslProxy) ? "s" : "")}://${this.options.server.options.domain}${this.options.redirectPath}`;
  }
  get link() {
    return `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(this.options.id)}&scope=${encodeURIComponent(this.options.scopes.join(" "))}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&prompt=none`;
  }
  redirect(res) {
    res.redirect(this.link);
  }
  async auth(req) {
    try {
      var result = await request.post({
        "url": "https://discord.com/api/oauth2/token",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": new URLSearchParams({
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "grant_type": "authorization_code",
          "code": req.query.code,
          "redirect_uri": this.redirectUri
        })
      });
    } catch(e) {
      return !1;
    }
    if (result.response.status == 200) {
      this.writeToken(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  async renew() {
    if (!this.available) {
      throw new Error("renew: Not available.");
    }
    try {
      var result = await request.post({
        "url": "https://discord.com/api/oauth2/token",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": new URLSearchParams({
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "grant_type": "refresh_token",
          "refreshToken": this.options.refreshToken
        })
      });
    } catch(e) {
      return !1;
    }
    if (result.response.status == 200) {
      this.writeToken(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  async revoke() {
    if (!this.available) {
      throw new Error("revoke: Not available.");
    }
    try {
      var result = await request.post({
        "url": "https://discord.com/api/oauth2/token/revoke",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": new URLSearchParams({
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "token": this.options.accessToken
        })
      });
    } catch(e) {
      return !1;
    }
    if (result.response.status == 200) {
      this.options.accessToken = "";
      this.options.refreshToken = "";
      return !0;
    } else {
      return !1;
    }
  }
  async sync() {
    if (!this.available) {
      throw new Error("sync: Not available.");
    }
    try {
      var result = await request.get({
        "url": `https://discord.com/api/v${this.options.apiv}/users/@me`,
        "headers": {
          "Authorization": `${this.options.tokenType} ${this.options.accessToken}`
        }
      });
    } catch(e) {
      return !1;
    }
    if (result.response.status == 200) {
      this.user = new User(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  writeToken(body) {
    this.options.tokenType = body.token_type;
    this.options.accessToken = body.access_token;
    this.options.expires = new Date(Date.now() + (body.expires_in * 1000));
    this.options.refreshToken = body.refresh_token;
  }
  get expired() {
    return (Date.now() >= this.options.expires.getTime());
  }
}

module.exports = { Bot, UserFlags, User, ApplicationFlags, Application, MessageBuilder, AuthClient };