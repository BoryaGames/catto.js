module.exports = class {
  constructor(value, names) {
    this.value = BigInt(value || 0);
    this.names = (names || []);
  }
  resolveName(name) {
    if (typeof name === "number") {
      return name;
    }
    if (!this.names.includes(name)) {
      throw "Unknown name.";
    }
    return this.names.indexOf(name);
  }
  has(bit) {
    return (this.value & (1n << BigInt(this.resolveName(bit)))) !== 0n;
  }
  add(bit) {
    this.value |= (1n << BigInt(this.resolveName(bit)));
  }
  remove(bit) {
    this.value &= ~(1n << BigInt(this.resolveName(bit)));
  }
  all() {
    var current = this.value;
    var index = 0;
    var result = [];
    while(current !== 0n) {
      if ((current & (1n << BigInt(index))) !== 0n) {
        result.push(this.names[index] || index);
        current &= ~(1n << BigInt(index));
      }
      index++;
    }
    return result;
  }
};