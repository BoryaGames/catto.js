var Discord = require("discord.js");
module.exports = class MessageBuilder {
  constructor(bot) {
    this.bot = bot;
    this.data = {};
  }
  text(t) {
    this.data.content = t;
    return this;
  }
  button(basic, execute) {
    var btn = new Discord.ButtonBuilder();
    if (!basic.id && !basic.url) {
      throw new Error("All buttons except URL must have ID.");
    }
    btn.setCustomId(basic.id);
    btn.setDisabled(basic.disabled);
    if (basic.emoji) {
      btn.setEmoji(basic.emoji);
    }
    if (basic.label) {
      btn.setLabel(basic.label);
    }
    if (!basic.emoji && !basic.label) {
      throw new Error("Can't have an empty button.");
    }
    var stylelib = {
      "blue": "Primary",
      "gray": "Secondary",
      "lime": "Success",
      "red": "Danger"
    };
    basic.style = basic.style.toLowerCase();
    if (!stylelib.includes(basic.style) && !basic.url) {
      throw new Error("Unknown style.");
    }
    if (basic.url) {
      btn.setStyle(Discord.ButtonStyle.Link);
      btn.setURL(basic.url);
    } else {
      btn.setStyle(Discord.ButtonStyle[stylelib[basic.style]]);
    }
    if (!this.data.components) {
      this.data.components = [];
    }
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
    if (!bot.url) {
      bot.buttons.set(basic.id, execute);
    }
    return this;
  }
};
