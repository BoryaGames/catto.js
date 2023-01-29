function float(min, max) {
  return (Math.random() *(max -min) +min);
}
function int(min, max) {
  return Math.floor(Math.random() *(max -min) +min);
}
function range(min, max) {
  return Math.floor(Math.random() *(max -min +1) +min);
}
function bool() {
  return !Math.floor(Math.random() *2);
}
module.exports = {
  float, int, range, bool
};