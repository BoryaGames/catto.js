/**
* Функция для отключения тегов HTML
* @param {string} text - Текст, в котором нужно отключить теги HTML
* @returns {string} Текст с отключенными тегами HTML
*/
function disable(text) {
  return text.split("<").join("&lt;").split(">").join("&gt;");
}
module.exports = {
  disable
};
