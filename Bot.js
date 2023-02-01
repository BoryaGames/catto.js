var events = require("events");
var Discord = require("discord.js");
if (typeof EventEmitter !== "undefined") {} else {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {
  constructor(options) {
    this.options = Object.assign({
      "token": "",
      "intents": 98045
    }, options || {});
    this.client = new Discord.Client({
      "intents": new Discord.IntentsBitField(this.options.intents)
    });
  }
  async run() {
    return new Promise((res, rej) => {
      this.client.login(this.options.token).then(() => {
        this.emit("running");
        res();
      }).catch(rej);
    });
  }
};
