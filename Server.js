var events = require("events");
var express = require("express");
var expressWs = require("express-ws");
var vm = require("vm");
var http = require("http");
var https = require("https");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({
  "limit": "50mb",
  "extended": !0
});
var jsonParser = bodyParser.json({
  "limit": "50mb"
});
var fs = require("fs");
var path = require("path");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
if (typeof EventEmitter !== "undefined") {} else {
  var { EventEmitter } = events;
}
class Server extends EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign({
      "domain": null,
      "port": (process.env.PORT || process.env.SERVER_PORT || 80),
      "ssl": !1,
      "sslProxy": !1,
      "cert": null,
      "key": null,
      "serverOptions": {},
      "websocket": !0,
      "expressWsiOptions": {},
      "secret": null,
      "storeOptions": {},
      "ejs": !1,
      "cjs": !1,
      "cjsClient": !0,
      "proxies": 0,
      "bodyCompatible": !1,
      "secureCookie": !0,
      "cookieAge": 31536e6
    }, options || {});
    this.app = express();
    if (this.options.ssl) {
      this.server = https.createServer(Object.assign(this.options.serverOptions, {
        "cert": fs.readFileSync(path.join(__dirname, "..", "..", this.options.cert), "utf8"),
        "key": fs.readFileSync(path.join(__dirname, "..", "..", this.options.key), "utf8")
      }), this.app);
    } else {
      this.server = http.createServer(this.options.serverOptions, this.app);
    }
    if (this.options.websocket) {
      this.expressWsi = expressWs(this.app, this.server, this.options.expressWsiOptions);
    } else {
      this.expressWsi = null;
    }
    if (this.options.proxies == -1) {
      this.app.set("trust proxy", !0);
    } else if (this.options.proxies > 0) {
      this.app.set("trust proxy", this.options.proxies);
    }
    if (!this.options.bodyCompatible) {
      this.app.use(urlencodedParser);
      this.app.use(jsonParser);
    }
    if (this.options.ejs) {
      this.app.set("view engine", "ejs");
    }
    if (this.options.cjs) {
      Server.injectCJS(this.app, !1, this.options.cjsClient);
    }
    if (this.options.secret) {
      this.app.use(session({
        "store": new FileStore(Object.assign(this.options.storeOptions, {
          "logFn": () => {}
        })),
        "secret": this.options.secret,
        "cookie": {
          "secure": this.options.secureCookie,
          "maxAge": this.options.cookieAge
        },
        "resave": !0,
        "saveUninitialized": !0
      }));
    }
  }
  run() {
    this.server.listen(this.options.port, () => {
      this.emit("running");
    });
    return this;
  }
  all(...args) {
    this.app.all(...args);
    return this;
  }
  delete(...args) {
    this.app.delete(...args);
    return this;
  }
  disable(...args) {
    this.app.disable(...args);
    return this;
  }
  disabled(...args) {
    this.app.disabled(...args);
    return this;
  }
  enable(...args) {
    this.app.enable(...args);
    return this;
  }
  enabled(...args) {
    this.app.enabled(...args);
    return this;
  }
  engine(...args) {
    this.app.engine(...args);
    return this;
  }
  get(...args) {
    this.app.get(...args);
    return this;
  }
  param(...args) {
    this.app.param(...args);
    return this;
  }
  patch(...args) {
    this.app.patch(...args);
    return this;
  }
  path(...args) {
    this.app.path(...args);
    return this;
  }
  post(...args) {
    this.app.post(...args);
    return this;
  }
  put(...args) {
    this.app.put(...args);
    return this;
  }
  render(...args) {
    this.app.render(...args);
    return this;
  }
  route(...args) {
    this.app.route(...args);
    return this;
  }
  set(...args) {
    this.app.set(...args);
    return this;
  }
  use(...args) {
    this.app.use(...args);
    return this;
  }
  ws(...args) {
    this.app.ws(...args);
    return this;
  }
  static(folder, pathname) {
    if (pathname) {
      this.app.use(pathname, express.static(path.join(__dirname,"..","..",folder)));
    } else {
      this.app.use(express.static(path.join(__dirname,"..","..",folder)));
    }
    return this;
  }
  static renderCJS(app, wclient, filepath, options, callback) {
    var code = fs.readFileSync(filepath).toString("utf-8");
    var doctype = code.startsWith("<!DOCTYPE html>");
    if (doctype) {
      code = code.replace(/^<!DOCTYPE html>(\r?\n)?/, "");
    }
    var parts = code.split(/<%s(?:erver)?(?!\*)(?!=) +(.+?) +%>/g);
    var compile = `var __output = "${doctype ? "<!DOCTYPE html>\\n" : ""}${wclient ? `<script src=\\"/_cattojs/cjs_client.js\\"></script>\\n` : ""}";\nfunction __escape(str) {\n  if (str === void 0) {\n    return "undefined";\n  }\n  if (typeof str !== "string") {\n    str = str.toString();\n  }\n  return str.split("<").join("&lt;").split(">").join("&gt;");\n}\n`;
    parts.forEach((part, index) => {
      compile += ((index + 1) % 2 < 1 ? `${part}\n` : `__output += ${JSON.stringify(part)}.replace(/<%s(?:erver)?(?!\\*)= +(.+?) +%>/g, (_, g) => __escape(eval(g))).replace(/<%s(?:erver)?(?!\\*)- +(.+?) +%>/g, (_, g) => eval(g)).replace(/<%s(erver)\\*?# +(.+?) +%>/g, "");\n`);
    });
    var context = vm.createContext(Object.assign({
      "include": (filepath, options) => Server.renderCJS(app, path.join(app.get("views"), filepath.endsWith(".cjs") ? filepath : `${filepath}.cjs`), options)
    }, options));
    vm.runInContext(compile, context);
    if (typeof callback === "function") {
      callback(null, context.__output);
    }
    return context.__output;
  }
  static injectCJS(app, nows, wclient) {
    app.engine("cjs", Server.renderCJS.bind(null, app, wclient)).set("view engine", "cjs").get("/_cattojs/cjs_client.js", (req, res) => {
      res.sendFile(path.join(__dirname, "cjs_client.js"));
    });
    if (!nows && !app.ws) {
      expressWs(app);
      app._cjs_sdynamic = [];
      app.ws("/_cattojs/cjs_sdynamic", (ws, req) => {
        app._cjs_sdynamic.push(ws);
        ws.on("close", () => {
          app._cjs_sdynamic = app._cjs_sdynamic.filter(client => client !== ws);
        });
      });
    }
  }
  static fa(text) {
    return (req,res) => {
      res.end(text);
    };
  }
}

module.exports = Server;
