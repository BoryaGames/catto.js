module.exports = class {
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
  get coverImageHas() {
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
  get badges() {
    var i = 24;
    var p = this.options.flags;
    var f = [];
    while (--i > -1) {
      if (p >= (1 << i)) {
        p -= (1 << i);
        f.push(i);
      }
    }
    var fl = [
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
      null,
      null,
      "GATEWAY_PRESENCE",
      "GATEWAY_PRESENCE_LIMITED",
      "GATEWAY_GUILD_MEMBERS",
      "GATEWAY_GUILD_MEMBERS_LIMITED",
      "VERIFICATION_PENDING_GUILD_LIMIT",
      "EMBEDDED",
      "GATEWAY_MESSAGE_CONTENT",
      "GATEWAY_MESSAGE_CONTENT_LIMITED",
      null,
      null,
      null,
      "APPLICATION_COMMAND_BADGE"
    ];
    return f.map(n => fl[n]).filter(n => n);
  }
  get tags() {
    return this.options.tags;
  }
  get intents() {
    return this.badges.filter(badge => ![null, "VERIFICATION_PENDING_GUILD_LIMIT", "EMBEDDED", "APPLICATION_COMMAND_BADGE"].includes(badge));
  }
  get cannotVerify() {
    return this.badges.has("VERIFICATION_PENDING_GUILD_LIMIT");
  }
  get canVerify() {
    return !this.cannotVerify;
  }
  get isEmbedded() {
    return this.badges.has("EMBEDDED");
  }
  get supportsSlash() {
    return this.badges.has("APPLICATION_COMMAND_BADGE");
  }
};
