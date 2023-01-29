Array.prototype.remove = function(index) {
  return this.splice(index, 1)[0];
};