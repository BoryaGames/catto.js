module.exports = {
  "disable": text => {
    return text.split("<").join("&lt;").split(">").join("&gt;");
  }
};