"use strict";

// catto.js

(() => {
  var incid = -1;
  var cache = {};
  function render(code) {
    code = code.split("&lt;").join("<").split("&gt;").join(">");
    var parts = code.split(/<%c(?:lient)?(?!\*)(?!=) +(.+?) +%>/g);
    var output = "";
    var compile = "";
    parts.forEach((part, index) => {
      compile += ((index + 1) % 2 < 1 ? `${part}\n` : `output += ${JSON.stringify(part)}.replace(/<%c(?:lient)?(\\*)?= +(.+?) +%>/g, (_, t, g) => __rpf(t, g, eval(g), !0)).replace(/<%c(?:lient)?(\\*)?- +(.+?) +%>/g, (_, t, g) => __rpf(t, g, eval(g), !1)).replace(/<%c(lient)\\*?# +(.+?) +%>/g, "");\n`);
    });
    window.__rpf = (t, g, result, r) => {
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
    };
    eval(compile);
    delete window.__rpf;
    return output;
  }
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof window.$ === "undefined") {
      window.$ = selector => document.querySelector(selector);
    }
    document.documentElement.innerHTML = render(document.documentElement.innerHTML);
  });
})();