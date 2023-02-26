var request = require("./request");
var Application = require("./Application");
module.exports = class {
  constructor(options, bot) {
    this.options = Object.assign({
      "id": "",
      "username": "",
      "avatar": "",
      "discriminator": "",
      "public_flags": 0,
      "flags": 0,
      "banner": "",
      "banner_color": "",
      "accent_color": 0,
      "locale": "",
      "mfa_enabled": !1,
      "premium_type": 0,
      "email": "",
      "verified": !1,
      "bot": !1,
      "system": !1
    }, options || {});
    this.bot = bot;
    if (this.isBot) {
      request.get({
        "url": `https://discord.com/api/v${(this.bot ? (this.bot.client.rest.version ? this.bot.client.rest.version.toString() : "10") : "10")}/oauth2/applications/${this.id}/rpc`,
        "headers": {
          "Authorization": `Bot ${this.bot.client.token}`
        }
      }).then(application => {
        this.application = new Application(application.body);
      });
    }
  }
  get id() {
    return this.options.id;
  }
  get name() {
    return this.options.username;
  }
  get avatarHash() {
    return this.options.avatar;
  }
  get avatar() {
    var avataru = this.avatarHash;
    if (avataru && avataru.startsWith("a_")) {
      avataru = `https://cdn.discordapp.com/avatars/${this.id}/${avataru}.gif?size=4096`;
    } else if (avataru) {
      avataru = `https://cdn.discordapp.com/avatars/${this.id}/${avataru}.webp?size=4096`;
    } else {
      avataru = `https://cdn.discordapp.com/embed/avatars/${(parseInt(this.discrim) % 5).toString()}.png`;
    }
    return avataru;
  }
  get discrim() {
    return this.options.discriminator;
  }
  get tag() {
    return `${this.name}#${this.discrim}`;
  }
  get badges() {
    var i = 23;
    var p = (this.options.flags ? (this.options.flags.bitfield ? this.options.flags.bitfield : this.options.flags) : (this.options.public_flags.bitfield ? this.options.public_flags.bitfield : this.options.public_flags));
    var f = [];
    while (--i > -1) {
      if (![21, 20, 15, 13, 12, 11, 5, 4].includes(i) && p >= (1 << i)) {
        p -= (1 << i);
        f.push(i);
      }
    }
    var fl = [
      "STAFF",
      "PARTNER",
      "HYPESQUAD",
      "BUG_HUNTER_LEVEL_1",
      null,
      null,
      "HYPESQUAD_ONLINE_HOUSE_1",
      "HYPESQUAD_ONLINE_HOUSE_2",
      "HYPESQUAD_ONLINE_HOUSE_3",
      "PREMIUM_EARLY_SUPPORTER",
      "TEAM_PSEUDO_USER",
      null,
      null,
      null,
      "BUG_HUNTER_LEVEL_2",
      null,
      "VERIFIED_BOT",
      "VERIFIED_DEVELOPER",
      "CERTIFIED_MODERATOR",
      "BOT_HTTP_INTERACTIONS",
      null,
      null,
      "ACTIVE_DEVELOPER"
    ];
    return f.map(n => fl[n]);
  }
  get bannerHash() {
    return this.options.banner;
  }
  get bannerColor() {
    return this.options.banner_color;
  }
  get banner() {
    var banneru = this.bannerHash;
    if (banneru && banneru.startsWith("a_")) {
      banneru = `https://cdn.discordapp.com/banners/${this.id}/${banneru}.gif?size=4096`;
    } else if (banneru) {
      banneru = `https://cdn.discordapp.com/banners/${this.id}/${banneru}.webp?size=4096`;
    } else {
      banneru = this.bannerColor || this.accentColor;
    }
    return banneru;
  }
  get accentColor() {
    return this.options.accent_color;
  }
  get lang() {
    return this.options.locale;
  }
  get isRussian() {
    return (this.lang == "ru");
  }
  get is2FAEnabled() {
    return this.options.mfa_enabled;
  }
  get hasNitro() {
    return (this.isBot || this.options.premium_type > 0);
  }
  get hasNitroClassic() {
    return (this.options.premium_type == 1);
  }
  get hasNitroBoost() {
    return (this.isBot || this.options.premium_type == 2);
  }
  get hasNitroBasic() {
    return (this.options.premium_type == 3);
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
    return this.badges.has("VERIFIED_BOT");
  }
  get isSystem() {
    return this.options.system;
  }
};
