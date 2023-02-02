Array.prototype.remove = function(index) {
  return this.splice(index, 1)[0];
};
Array.prototype.has = function(data) {
  return this.includes(data);
};
