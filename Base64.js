module.exports = {
  "encode": text => {
    return Buffer.from(text, "utf-8").toString("base64")
  },
  "decode": text => {
    return Buffer.from(text, "base64").toString("utf-8")
  }
};