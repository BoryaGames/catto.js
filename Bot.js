var events = require("events");
if (typeof EventEmitter !== "undefined") {} else {
  var { EventEmitter } = events;
}
module.exports = class extends EventEmitter {};
