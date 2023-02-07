/**
 * Encodes a string to base64.
 * @function
 * @param {string} text - The text to be encoded.
 * @returns {string} - The encoded text in base64.
 */
function encode(text) {
  return Buffer.from(text, "utf-8").toString("base64")
}
/**
 * Decodes a base64 string.
 * @function
 * @param {string} text - The text to be decoded.
 * @returns {string} - The decoded text.
 */
function decode(text) {
  return Buffer.from(text, "base64").toString("utf-8")
}
module.exports = {
  encode,
  decode
};
