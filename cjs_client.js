"use strict";

// catto.js

(() => {
  var symbol = window._CATTOJS_SYMBOL || "%";
  var updateTime = window._CATTOJS_UPDATE_TIME || 1;

  var incid = 0;
  var cache = {};
  var ignoret = !1;
  var dstartcode = "output += `<span id=\"_cattojs_d%\">`;\ncfs[%] = function() {\nvar ignoret = !0;\n";
  var dendcode = "};\ncfs[%]();\noutput += `</span>`;\n";
  function render(code) {
    code = code.split("&lt;").join("<").split("&gt;").join(">").split("&amp;").join("&");
    var parts = code.split(new RegExp(`<${symbol}c(?:lient)?(\\*)?(?!=) +(.+?) +${symbol}>`, "g"));
    var output = "";
    var compile = "";
    var did = 0;
    var ob = 0;
    var cfs = {};
    parts.forEach((part, index) => {
      if ((index + 1) % 3 == 2) {
        if (!did && part == "*") {
          compile += dstartcode.split("%").join(++incid);
          did = incid;
        }
        return;
      }
      if ((index + 1) % 3 < 1) {
        var instr = !1;
        var chstr = "";
        for (var char of part) {
          if (!instr && "'\"`".includes(char)) {
            instr = !0;
            chstr = char;
          }
          if (instr && char == chstr) {
            instr = !1;
          }
          if (!instr && char == "{") {
            ob++;
          }
          if (!instr && char == "}") {
            ob--;
          }
        }
      }
      compile += ((index + 1) % 3 < 1 ? `${part}\n` : `output += ${JSON.stringify(part)}.replace(/<${symbol}c(?:lient)?(\\*)?= +(.+?) +${symbol}>/g, (_, t, g) => __rpf(t, g, eval(g), !0, ignoret)).replace(/<${symbol}c(?:lient)?(\\*)?- +(.+?) +${symbol}>/g, (_, t, g) => __rpf(t, g, eval(g), !1, ignoret)).replace(/<${symbol}c(lient)\\*?# +(.+?) +${symbol}>/g, "");\n`);
      if (did && !ob) {
        compile += dendcode.split("%").join(did);
        did = 0;
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
          if (result2 === void 0) {
            return "undefined";
          }
          if (typeof result2 !== "string") {
            result2 = result2.toString();
          }
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
        setInterval(update.bind(null, ++incid, g, r), updateTime);
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
      setInterval(() => Object.entries(cfs).forEach(updateb), updateTime);
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
