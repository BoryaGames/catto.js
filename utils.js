Array.prototype.remove = function(index) {
  return this.splice(index, 1)[0];
};
Array.prototype.has = function(data) {
  return this.includes(data);
};
var utils = {};
utils.waitFor = (obj, prop) => {
  return new Promise(r => {
    var i = setInterval(() => {
      if (obj[prop]) {
        clearInterval(i);
        r();
      }
    }, 1);
  });
};
module.exports = utils;
