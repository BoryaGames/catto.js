Object.defineProperty(Array.prototype, "remove", {
  "value": function(index) {
    return this.splice(index, 1)[0];
  },
  "enumerable": false
});
Object.defineProperty(Array.prototype, "has", {
  "value": function(data) {
    return this.includes(data);
  },
  "enumerable": false
});
Object.defineProperty(Array.prototype, "random", {
  "value": function() {
    return this[Math.floor(Math.random() *this.length)];
  },
  "enumerable": false
});

Object.defineProperty(String.prototype, "replaceAsync", {
  "value": async function(regex, asyncFn) {
    var promises = [];
    this.replace(regex, (full, ...args) => {
      promises.push(asyncFn(full, ...args));
      return full;
    });
    var data = await Promise.all(promises);
    return this.replace(regex, () => data.shift());
  },
  "enumerable": false
});

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
