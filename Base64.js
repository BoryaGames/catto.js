function encode(text) {
  return Buffer.from(text, "utf-8").toString("base64");
}

function decode(text) {
  return Buffer.from(text, "base64").toString("utf-8");
}

module.exports = { encode, decode };