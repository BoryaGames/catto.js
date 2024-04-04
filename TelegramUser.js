var TelegramFile = require("./TelegramFile");
module.exports = class {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
  }
  get id() {
    return this.data.id;
  }
  get isBot() {
    return this.data.is_bot;
  }
  get firstName() {
    return this.data.first_name;
  }
  get lastName() {
    return this.data.last_name;
  }
  get username() {
    return this.data.username;
  }
  get language() {
    return this.data.language_code;
  }
  get avatars() {
    return new Promise(res => {
      this.bot.client.getUserProfilePhotos(this.id).then(result => res(result.photos.map(row => row.map(photo => new TelegramFile(photo, this.bot)))));
    });
  }
};