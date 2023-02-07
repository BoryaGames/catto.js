/**
 * A class representing an application's information.
 * @class
 */
module.exports = class {
  /**
   * Creates an instance of Application.
   * @param {Object} [options={}] - An object containing information about the application.
   * @property {String} options.id - The ID of the application.
   * @property {String} options.name - The name of the application.
   * @property {String} options.icon - The hash for the application's icon.
   * @property {String} options.description - A description of the application.
   * @property {String} options.cover_image - The hash for the application's cover image.
   * @property {String} options.guild_id - The ID of the server the application is connected to.
   * @property {Boolean} options.bot_public - A flag indicating whether the bot is public.
   * @property {Boolean} options.bot_require_code_grant - A flag indicating whether the bot requires code grant.
   * @property {String} options.terms_of_service_url - The URL for the application's terms of service.
   * @property {String} options.privacy_policy_url - The URL for the application's privacy policy.
   * @property {Object} options.install_params - Installation parameters for the application.
   * @property {String} options.verify_key - A verify key for the application.
   * @property {Number} options.flags - A number representing the application's flags.
   * @property {Array} options.tags - An array of tags for the application.
   */
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
  /**
   * Gets the ID of the application.
   * @returns {String} - The ID of the application.
   */
  get id() {
    return this.options.id;
  }
  /**
   * Gets the name of the application.
   * @returns {String} - The name of the application.
   */
  get name() {
    return this.options.name;
  }
  /**
   * Gets the hash for the application's icon.
   * @returns {String} - The hash for the application's icon.
   */
  get iconHash() {
    return this.options.icon;
  }
  /**
   * Gets the description of the application.
   * @returns {String} - A description of the application.
   */
  get description() {
    return this.options.description;
  }
  /**
   * Gets the hash for the application's cover image.
   * @returns {String} - The hash for the application's cover image.
   */
  get coverImageHash() {
    return this.options.cover_image;
  }
  /**
   * Gets the ID of the server the application is connected to.
   * @returns {String} - The ID of the server the application is connected to.
   */
  get server() {
    return this.options.guild_id;
  }
  /**
   * Gets a flag indicating whether the bot is public.
   * @returns {Boolean} - A flag indicating whether the bot is public.
   */
  get isPublic() {
    return this.options.bot_public;
  }
  /**
   * Gets a flag indicating whether the bot requires code grant.
   * @returns {Boolean} - A flag indicating whether the bot requires code grant.
   */
  get requireCodeGrant() {
    return this.options.bot_require_code_grant;
  }
  /**
   * Getter method to return the URL for the Terms of Service for this bot application.
   * @returns {string} URL for the Terms of Service.
   */
  get TOS() {
    return this.options.terms_of_service_url;
  }
  /**
   * Getter method to return the URL for the Privacy Policy for this bot application.
   * @returns {string} URL for the Privacy Policy.
   */
  get privacyPolicy() {
    return this.options.privacy_policy_url;
  }
  /**
   * Getter method to return the installation parameters for this bot application.
   * @returns {object} Installation parameters.
   */
  get installParams() {
    return this.options.install_params;
  }
  /**
   * Getter method to return the verification key for this bot application.
   * @returns {string} Verification key.
   */
  get verifyKey() {
    return this.options.verify_key;
  }
  /**
   * Getter method to return an array of badges for this bot application.
   * @returns {Array} Array of badges.
   */
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
  /**
   * Getter method to return an array of tags for this bot application.
   * @returns {Array} Array of tags.
   */
  get tags() {
    return this.options.tags;
  }
  /**
   * Getter method to return an array of intents for this bot application.
   * @returns {Array} Array of intents.
   */
  get intents() {
    return this.badges.filter(badge => ![null, "VERIFICATION_PENDING_GUILD_LIMIT", "EMBEDDED", "APPLICATION_COMMAND_BADGE"].includes(badge));
  }
  /**
   * Gets a boolean indicating if the application cannot be verified.
   * @returns {boolean} A boolean indicating if the application cannot be verified.
   */
  get cannotVerify() {
    return this.badges.has("VERIFICATION_PENDING_GUILD_LIMIT");
  }
  /**
   * Gets a boolean indicating if the application can be verified.
   * @returns {boolean} A boolean indicating if the application can be verified.
   */
  get canVerify() {
    return !this.cannotVerify;
  }
  /**
   * Gets a boolean indicating if the application is embedded.
   * @returns {boolean} A boolean indicating if the application is embedded.
   */
  get isEmbedded() {
    return this.badges.has("EMBEDDED");
  }
  /**
   * Gets a boolean indicating if the application supports the slash command.
   * @returns {boolean} A boolean indicating if the application supports the slash command.
   */
  get supportsSlash() {
    return this.badges.has("APPLICATION_COMMAND_BADGE");
  }
};
