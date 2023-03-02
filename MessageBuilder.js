var Discord = require("discord.js");
class MessageBuilder {
  constructor(bot) {
    this.bot = bot;
    this.data = {};
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
    this.data.ephemeral = !0;
    return this;
  }
  notEphemeral() {
    this.data.ephemeral = !1;
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
}
module.exports = MessageBuilder;
