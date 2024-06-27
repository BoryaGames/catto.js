Array.prototype.remove = function(index) {
  return this.splice(index, 1)[0];
};
Array.prototype.has = function(data) {
  return this.includes(data);
};
String.prototype.replaceAsync = async function(regex, asyncFn) {
  var promises = [];
  this.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  var data = await Promise.all(promises);
  return this.replace(regex, () => data.shift());
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
