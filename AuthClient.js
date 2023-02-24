var request = require("./request");
var User = require("./User");
module.exports = class {
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
    return (this.options.server
       && this.options.scopes.length > 0
       && this.options.id
       && this.options.secret
       && this.options.tokenType
       && this.options.accessToken
       && this.options.expires
       && this.options.refreshToken
       && this.options.apiv
       && this.options.redirectPath
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
        "form": {
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "grant_type": "authorization_code",
          "code": req.query.code,
          "redirect_uri": this.redirectUri
        }
      });
    } catch(e) {
      return !1;
    }
    if (result.response.statusCode == 200) {
      this.writeToken(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  async renew() {
    if (!this.available) {
      throw new Error(`renew: Not available.`);
    }
    try {
      var result = await request.post({
        "url": "https://discord.com/api/oauth2/token",
        "form": {
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "grant_type": "refresh_token",
          "refreshToken": this.options.refreshToken
        }
      });
    } catch(e) {
      return !1;
    }
    if (result.response.statusCode == 200) {
      this.writeToken(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  async revoke() {
    if (!this.available) {
      throw new Error(`revoke: Not available.`);
    }
    try {
      var result = await request.post({
        "url": "https://discord.com/api/oauth2/token/revoke",
        "form": {
          "client_id": this.options.id,
          "client_secret": this.options.secret,
          "token": this.options.accessToken
        }
      });
    } catch(e) {
      return !1;
    }
    if (result.response.statusCode == 200) {
      this.options.accessToken = "";
      this.options.refreshToken = "";
      return !0;
    } else {
      return !1;
    }
  }
  async sync() {
    if (!this.available) {
      throw new Error(`sync: Not available.`);
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
    if (result.response.statusCode == 200) {
      this.user = new User(result.body);
      return !0;
    } else {
      return !1;
    }
  }
  writeToken(body) {
    this.options.tokenType = body.token_type;
    this.options.accessToken = body.access_token;
    this.options.expires = new Date(Date.now() +(body.expires_in *1e3));
    this.options.refreshToken = body.refresh_token;
  }
  get expired() {
    return (Date.now() >= this.options.expires.getTime());
  }
};
