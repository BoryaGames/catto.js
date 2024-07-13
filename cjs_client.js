"use strict";

// catto.js

(() => {
  var symbol = "%";

  var incid = -1;
  var cache = {};
  var ignoret = !1;
  var dstartcode = "output += `<span id=\"_cattojs_d%\">`;\ncfs[%] = function() {\nvar ignoret = !0;\n";
  var dendcode = "};\ncfs[%]();\noutput += `</span>`;\n";
  function render(code) {
    code = code.split("&lt;").join("<").split("&gt;").join(">").split("&amp;").join("&");
    var parts = code.split(new RegExp(`<${symbol}c(?:lient)?(\\*)?(?!=) +(.+?) +${symbol}>`, "g"));
    var output = "";
    var compile = "";
    var dstreak = 0;
    var did = 0;
    var cfs = {};
    parts.forEach((part, index) => {
      if ((index + 1) % 3 == 2) {
        if (part == "*") {
          dstreak++;
        } else if (dstreak) {
          dstreak = -1;
        } else {
          dstreak = 0;
        }
        return;
      }
      if (dstreak == 1 && (index + 1) % 3 < 1) {
        compile += dstartcode.split("%").join(++incid);
        did = incid;
      }
      if (dstreak == -1) {
        dstreak = 0;
        compile += dendcode.split("%").join(did);
      }
      compile += ((index + 1) % 3 < 1 ? `${part}\n` : `output += ${JSON.stringify(part)}.replace(/<${symbol.replace("\\", "\\\\")}c(?:lient)?(\\*)?= +(.+?) +${symbol.replace("\\", "\\\\")}>/g, (_, t, g) => __rpf(t, g, eval(g), !0, ignoret)).replace(/<${symbol.replace("\\", "\\\\")}c(?:lient)?(\\*)?- +(.+?) +${symbol.replace("\\", "\\\\")}>/g, (_, t, g) => __rpf(t, g, eval(g), !1, ignoret)).replace(/<${symbol.replace("\\", "\\\\")}c(lient)\\*?# +(.+?) +${symbol.replace("\\", "\\\\")}>/g, "");\n`);
      if (dstreak && !parts[index + 2]) {
        dstreak = 0;
        compile += dendcode.split("%").join(did);
      }
    });
    function __rpf(t, g, result, r, ignoret) {
      if (result === void 0) {
        return "undefined";
      }
      if (typeof result !== "string") {
        result = result.toString();
      }
      if (r) {
        result = result.split("<").join("&lt;").split(">").join("&gt;");
      }
      if (!ignoret && t) {
        function update(id, code, format) {
          var result2 = eval(code);
          if (format) {
            result2 = result2.split("<").join("&lt;").split(">").join("&gt;");
          }
          if (cache[id] != result2) {
            cache[id] = result2;
            try {
              document.querySelector(`#_cattojs_d${id}`).innerHTML = result2;
            } catch(e) {
              throw `Dynamic element #${id} was deleted.`;
            }
          }
        }
        setInterval(update.bind(null, ++incid, g, r), 1);
        return `<span id="_cattojs_d${incid}">${result}</span>`;
      }
      return result;
    }
    eval(compile);
    function updateb(inf) {
      output = "";
      var id = inf[0];
      inf[1]();
      if (cache[id] != output) {
        cache[id] = output;
        document.querySelector(`#_cattojs_d${id}`).innerHTML = output;
      }
    }
    if (Object.keys(cfs).length) {
      setInterval(() => Object.entries(cfs).forEach(updateb), 1);
    }
    return output;
  }
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof window.$ === "undefined") {
      window.$ = selector => document.querySelector(selector);
    }
    document.documentElement.innerHTML = render(document.documentElement.innerHTML);
  });
})();
