module.exports = class {
  constructor() {
    this.data = {};
  }
  text(data) {
    if (!this.data.content) {
      this.data.content = data;
    } else {
      this.data.content += ` ${data}`;
    }
    return this;
  }
  buttons(rows) {
    this.data.replyMarkup = {
      "inline_keyboard": rows.map(row => row.map(btn => {
        switch(btn.type) {
          case "web":
            return {
              "text": btn.label,
              "url": btn.link
            };
            break;
          case "webapp":
            return {
              "text": btn.label,
              "web_app": {
                "url": btn.link
              }
            };
            break;
          case "interaction":
            return {
              "text": btn.label,
              "callback_data": btn.data
            };
            break;
          case "payment":
            return {
              "text": btn.label,
              "pay": !0
            };
            break;
          default:
            break;
        }
      }).filter(btn => btn))
    };
    return this;
  }
  keyboard(rows) {
    this.data.replyMarkup = {
      "keyboard": rows.map(row => row.map(btn => {
        switch(btn.type) {
          case "answer":
            return {
              "text": btn.label
            };
            break;
          case "webapp":
            return {
              "text": btn.label,
              "web_app": {
                "url": btn.link
              }
            };
            break;
          default:
            break;
        }
      }).filter(btn => btn))
    };
    return this;
  }
  payment(data) {
    this.data.invoiceExtra = {
      "title": data.title,
      "description": data.description,
      "payload": data.data,
      "currency": "XTR",
      "prices": [{
        "label": data.item,
        "amount": data.price
      }]
    };
    return this;
  }
};