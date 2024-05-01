"use strict";

// catto.js

(() => {
  var incid = -1;
  var cache = {};
  function render(code) {
    var parts = code.split(/&lt;%c(?:lient)?(?!\*)(?!=) +(.+?) +%&gt;/g);
    var output = "";
    var compile = "";
    parts.forEach((part, index) => {
      compile += ((index + 1) % 2 < 1 ? `${part}\n` : `output += ${JSON.stringify(part)};\n`);
    });
    eval(compile);
    function rpf(_, t, g, r) {
      var result = eval(g);
      if (r) {
        result = result.split("<").join("&lt;").split(">").join("&gt;");
      }
      if (t) {
        function update(id, code, format) {
          var result2 = eval(code);
          if (format) {
            result2 = result2.split("<").join("&lt;").split(">").join("&gt;");
          }
          if (cache[id] != result2) {
            cache[id] = result2;
            document.querySelector(`#_cattojs_d${id}`).innerHTML = eval(code);
          }
        }
        setInterval(update.bind(null, ++incid, g, r), 1);
        return `<span id="_cattojs_d${incid}">${result}</span>`;
      }
      return result;
    }
    output = output.replace(/&lt;%c(?:lient)?(\*)?= +(.+?) +%&gt;/g, (_, t, g) => rpf(_, t, g, !0));
    output = output.replace(/&lt;%c(?:lient)?(\*)?- +(.+?) +%&gt;/g, (_, t, g) => rpf(_, t, g, !1));
    output = output.replace(/&lt;%c(lient)\*?# +(.+?) +%&gt;/g, "");
    return output;
  }
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof window.$ === "undefined") {
      window.$ = selector => document.querySelector(selector);
    }
    document.documentElement.innerHTML = render(document.documentElement.innerHTML);
  });
})();
