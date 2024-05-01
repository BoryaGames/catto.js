"use strict";

// catto.js

(() => {
  var incid = -1;
  function render(code) {
    var parts = code.split(/&lt;%c(?:lient)?(?!\*)(?!=) +(.+?) +%&gt;/g);
    var output = "";
    var compile = "";
    parts.forEach((part, index) => {
      compile += ((index + 1) % 2 < 1 ? `${part}\n` : `output += ${JSON.stringify(part)};\n`);
    });
    eval(compile);
    function rpf(_, t, g, r) {
      if (t) {
        function update(id, code, format) {
          if (format) {
            document.querySelector(`#_cattojs_d${id}`).innerHTML = eval(code).split("<").join("&lt;").split(">").join("&gt;");
          } else {
            document.querySelector(`#_cattojs_d${id}`).innerHTML = eval(code);
          }
        }
        setInterval(update.bind(null, ++incid, g, r), 1);
        if (r) {
          return `<span id="_cattojs_d${incid}">${eval(g).split("<").join("&lt;").split(">").join("&gt;")}</span>`;
        } else {
          return `<span id="_cattojs_d${incid}">${eval(g)}</span>`;
        }
      }
      if (r) {
        return eval(g).split("<").join("&lt;").split(">").join("&gt;");
      } else {
        return eval(g);
      }
    }
    output = output.replace(/&lt;%c(?:lient)?(\*)?= +(.+?) +%&gt;/g, (_, t, g) => rpf(_, t, g, !0));
    output = output.replace(/&lt;%c(?:lient)?(\*)?- +(.+?) +%&gt;/g, (_, t, g) => rpf(_, t, g, !1));
    output = output.replace(/&lt;%c(lient)\*?# +(.+?) +%&gt;/g, "");
    return output;
  }
  window.addEventListener("load", () => {
    if (typeof window.$ === "undefined") {
      window.$ = selector => document.querySelector(selector);
    }
    document.documentElement.innerHTML = render(document.documentElement.innerHTML);
  });
})();