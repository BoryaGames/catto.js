module.exports = class {
  constructor(value, size, exclude) {
    this.value = value || 0;
    this.size = size || 32;
    this.exclude = exclude || [];
  }
  has(bit) {
    return (this.value & (1 << bit)) !== 0;
  }
  add(bit) {
    this.value |= (1 << bit);
  }
  remove(bit) {
    this.value &= ~(1 << bit);
  }
  all() {
    var bits = [];
    var i = 0;
    while (i < this.size) {
      if (!this.exclude.includes(i) && this.has(i)) {
        bits.push(i);
      }
      i++;
    }
    return bits;
  }
};
