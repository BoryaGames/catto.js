var HTML = require("./HTML");
var events = require("events");
var express = require("express");
var expressWs = require("express-ws");
var fs = require("fs");
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
      "expressWsiOptions": {},
      "secret": null,
      "storeOptions": {},
      "ejs": !1,
      "cjs": !1
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
    this.expressWsi = expressWs(this.app, this.server, this.options.expressWsiOptions);
    this.app.set("trust proxy", !0);
    this.app.use(urlencodedParser);
    this.app.use(jsonParser);
    if (this.options.ejs) {
      this.app.set("view engine", "ejs");
    }
    if (this.options.cjs) {
      this.app.engine("cjs", this.renderCJS).set("view engine", "cjs").get("/_cattojs/cjs_client.js", (req, res) => {
        res.sendFile(path.join(__dirname, "cjs_client.js"));
      });
    }
    if (this.options.secret) {
      this.app.use(session({
        "store": new FileStore(this.options.storeOptions),
        "secret": this.options.secret,
        "cookie": {
          "secure": (this.options.ssl || this.options.sslProxy)
        }
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
  renderCJS(filepath, options, callback) {
    var code = fs.readFileSync(filepath).toString("utf-8");
    var parts = code.split(/<%s(?:erver)?(?!\*)(?!=) +(.+?) +%>/g);
    var compile = `var __output = "<script src=\\"/_cattojs/cjs_client.js\\"></script>\\n";\n`;
    parts.forEach((part, index) => {
      compile += ((index + 1) % 2 < 1 ? `${part}\n` : `__output += ${JSON.stringify(part)};\n`);
    });
    var context = vm.createContext(options);
    vm.runInContext(compile, context);
    var output = context.__output;
    output = output.replace(/<%s(?:erver)?(?!\*)= +(.+?) +%>/g, (_, g) => HTML.disable(vm.runInContext(g, context)));
    output = output.replace(/<%s(?:erver)?(?!\*)- +(.+?) +%>/g, (_, g) => vm.runInContext(g, context));
    output = output.replace(/<%s(erver)\*?# +(.+?) +%>/g, "");
    callback(null, output);
  }
  static fa(text) {
    return (req,res) => {
      res.end(text);
    };
  }
}

module.exports = Server;
