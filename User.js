var request = require("./request");
var Application = require("./Application");
module.exports = class {
  constructor(options, bot) {
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
      "mfaEnabled": !1,
      "premiumType": 0,
      "email": "",
      "verified": !1,
      "bot": !1,
      "system": !1,
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
    return `https://cdn.discordapp.com/avatar-decoration-presets/${this.decorationHash}.png`;
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
  get flags() {
    var fl = [
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
      "INTERNAL_APPLICATION",
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
      null,
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
      "VERIFIED_EMAIL",
      "QUARANTINED",
      null,
      null,
      null,
      null,
      null,
      "COLLABORATOR",
      "RESTRICTED_COLLABORATOR"
    ];
    var i = (fl.length + 1);
    var p = (this.options.flags ? (this.options.flags.bitfield ? this.options.flags.bitfield : this.options.flags) : (this.options.publicFlags.bitfield ? this.options.publicFlags.bitfield : this.options.publicFlags));
    var f = [];
    while (--i > -1) {
      if (p >= (1 << i)) {
        p -= (1 << i);
        f.push(i);
      }
    }
    return f.map(n => fl[n]);
  }
  get badges() {
    return this.flags.filter(flag => ![
      "MFA_SMS",
      "PREMIUM_PROMO_DISMISSED",
      "TEAM_PSEUDO_USER",
      "INTERNAL_APPLICATION",
      "SYSTEM",
      "HAS_UNREAD_URGENT_MESSAGES",
      "UNDERAGE_DELETED",
      "VERIFIED_BOT",
      "BOT_HTTP_INTERACTIONS",
      "SPAMMER",
      "DISABLE_PREMIUM",
      "HIGH_GLOBAL_RATE_LIMIT",
      "DELETED",
      "DISABLED_SUSPICIOUS_ACTIVITY",
      "SELF_DELETED",
      "PREMIUM_DISCRIMINATOR",
      "USED_DESKTOP_CLIENT",
      "USED_WEB_CLIENT",
      "USED_MOBILE_CLIENT",
      "DISABLED",
      "VERIFIED_EMAIL",
      "QUARANTINED",
      "COLLABORATOR",
      "RESTRICTED_COLLABORATOR"
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
      banneru = `https://cdn.discordapp.com/banners/${this.id}/${banneru}.gif?size=4096`;
    } else if (banneru) {
      banneru = `https://cdn.discordapp.com/banners/${this.id}/${banneru}.webp?size=4096`;
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
        "url": `https://discord.com/api/v${(this.bot ? (this.bot.client.rest.version ? this.bot.client.rest.version.toString() : "10") : "10")}/oauth2/applications/${this.id}/rpc`,
        "headers": {
          "Authorization": `Bot ${this.bot.client.token}`
        }
      })).body);
    }
  }
};
