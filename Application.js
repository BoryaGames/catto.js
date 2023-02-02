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
    // TODO
  }
  get tags() {
    return this.options.tags;
  }
};
