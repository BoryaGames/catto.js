var Bitfield = require("./Bitfield");
module.exports = class extends Bitfield {
  constructor(value) {
    super(value, 23, [21, 20, 15, 13, 12, 11, 5, 4]);
  }
};
