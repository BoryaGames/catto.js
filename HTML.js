/**
 * Disables HTML tags in a given string.
 * @param {string} text - The string to disable HTML tags in.
 * @returns {string} - The string with HTML tags disabled.
 */
function disable(text) {
  return text.split("<").join("&lt;").split(">").join("&gt;");
}
module.exports = {
  disable
};
