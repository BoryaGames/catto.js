module.exports = class {
  constructor(data, bot) {
    this.data = data;
    this.bot = bot;
    this.path = null;
  }
  get id() {
    return this.data.file_id;
  }
  get link() {
    if (this.path) {
      return `https://api.telegram.org/file/bot${this.bot.options.token}/${this.path}`;
    } else {
      return new Promise(res => {
        this.bot.client.telegram.getFile(this.id).then(result => {
          this.path = result.file_path;
          res(this.link);
        });
      });
    }
  }
};