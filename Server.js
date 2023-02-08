var events = require("events");
var express = require("express");
var expressWs = require("express-ws");
var http = require("http");
var https = require("https");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({"extended":!0});
var jsonParser = bodyParser.json();
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
      "port": (process.env.PORT || 80),
      "ssl": !1,
      "sslProxy": !1,
      "cert": null,
      "key": null,
      "serverOptions": {},
      "expressWsiOptions": {},
      "secret": null,
      "storeOptions": {},
      "ejs": !1
    }, options || {});
    this.app = express();
    if (this.ssl) {
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
  static fa(text) {
    return (req,res) => {
      res.end(text);
    };
  }
}

module.exports = Server;
