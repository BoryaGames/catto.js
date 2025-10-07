# 😺 Catto.JS ✨
## *Most universal, easy and catty JavaScript module*

![Build](https://github.com/BoryaGames/catto.js/actions/workflows/test.yml/badge.svg)
![Contributors](https://img.shields.io/github/contributors/BoryaGames/CatMagick)
![Chat on Discord](https://img.shields.io/discord/916772281747931198?logo=discord)

**[English]** | [[Русский]](./README.ru.md)

Catto.JS is a module that is designed to help you with making a Discord/Telegram bot, Discord activities, a website using CJS syntax, sanitizing HTML, encoding/decoding Base64, working with Bitfields, generating random, making Oracle/GitHub API requests and just helping you use JavaScript.

## Features

- Host a web server just like in [ExpressJS](https://www.npmjs.com/package/express)
- Easily handle SSL, sessions (just like in [Express-Session](https://www.npmjs.com/package/express-session)) and WebSocket (just like in [Express-WS](https://www.npmjs.com/package/express-ws)) on your web server
- Make Discord bots/activities just like in [DiscordJS](https://www.npmjs.com/package/discord.js), but easier, more optimized and stable API
- Make Telegram bots just like [Telegraf](https://www.npmjs.com/package/telegraf), but easier and more Discord-like API
- Authorize on your website using Discord account
- Sanitize HTML to make sure you don't get hacked by an XSS
- Make Telegram web-apps and handle authorization
- Generate random numbers and booleans
- Make API requests
- Automatically handle Oracle API request signing
- Read and write files to [GitHub](https://github.com/) repository
- Easily work with BitFields
- Improve JavaScript experience by adding methods to existing arrays/strings
- This module is being maintained and updated frequently to make sure you don't have issues/bugs
- Stable API, very rare deprecations/breaking changes so you can update the module version without changing your code
- 🐈 Cats 🐈

## Installation

Catto.JS requires [Node.js](https://nodejs.org) to run. Minimal version of NodeJS depends on your use case - Catto.JS can work on very old versions as long as you disable some features.

CattoJS requires **v9.11.0+** to run, but other features like Discord bots may request you to use a newer version.

Install it in your project from [NPM Registry](https://www.npmjs.com/package/catmagick) using a package manager: [NPM](https://www.npmjs.com), [Yarn](https://yarnpkg.com) or [PNPM](https://pnpm.io).

```sh
# Install latest stable version from NPM Registry using NPM
npm install catto.js

# Install latest stable version from NPM Registry using Yarn
yarn add catto.js

# Install latest stable version from NPM Registry using PNPM
pnpm add catto.js
```

Or install the latest beta version in your project from [GitHub](https://github.com/BoryaGames/catto.js) using a package manager: [NPM](https://www.npmjs.com), [Yarn](https://yarnpkg.com) or [PNPM](https://pnpm.io).

```sh
# Install latest beta version from GitHub using NPM
npm install git+https://github.com/BoryaGames/catto.js.git

# Install latest beta version from GitHub using Yarn
yarn add git+https://github.com/BoryaGames/catto.js.git

# Install latest beta version from GitHub using PNPM
pnpm add https://github.com/BoryaGames/catto.js.git
```

### Getting started

```javascript
// Get started by importing catto.js
var cattojs = require("catto.js");
```

### Random

These functions are for generating random data.

```javascript
// Get a random floating point number between 1 and 5 inclusive
var num = cattojs.random.float(1, 5);

// Get a random number between 1 and 5 with starting number included (1, 2, 3, 4)
var num = cattojs.random.int(1, 5);

// Get a random number between 1 and 5 inclusive (1, 2, 3, 4, 5)
var num = cattojs.random.range(1, 5);

// Get a random logic value (false, true)
var num = cattojs.random.bool();
```

### HTML

These functions are for working with HTML text.

```javascript
// This is now safe to show in the browser without getting XSS
var safe = cattojs.HTML.disable("<script>console.log('hacked');</script>");
```

### Utilities

These functions help you use JavaScript.

```javascript
var arr = ["a", "b", "c"];
if (arr.has("b")) { // shortcut for .includes()
  arr.remove(1); // remove element by index and return element
}
```

```javascript
// You can now use async replaces
var str = await something.replaceAsync("dog", async () => "cat");
```

```javascript
// Code will resume execution after bot.loaded will become true value
await cattojs.utils.waitFor(bot, "loaded");
```

### Web Server

This class allows you to host a web server, let's start with creating one.

```javascript
var server = new cattojs.Server();
```

That's enough to create a web server, but you can add options (but they're all optional).

```javascript
var server = new cattojs.Server({
  "domain": "example.com", // your domain
  "port": 1234, // port, defaults to auto-detect (which works with Pterodactyl too!)
  "ssl": false, // if you want catto.js to host HTTPS, set this to true
  "cert": "mycert.pem", // if you set ssl to true, make sure to give a path to the SSL certificate
  "key": "mykey.pem", // if you set ssl to true, make sure to give a path to the SSL key
  "sslProxy": true, // or if your SSL is already given by a proxy (like CloudFlare), set this to true
  "proxies": 1, // amount of proxies between clients and your web server, set this to correctly determine client's ip, or set to -1 for any amount (unsafe), defaults to 0
  "websocket": true, // enable websocket support, defaults to true
  "secret": "catsAreAwesome123", // a secret password used to encrypt sessions, make sure to set this if you want to use sessions
  "secureCookie": true, // if session cookies should be HTTPS-only
  "cookieAge": 604800, // cookie expiration age in seconds, defaults to 1000 years
  "bodyCompatible": false, // set this to true if some module like express-http-proxy is reading raw body, this will disable body parsing, defaults to false
  "ejs": false, // set this to true to use res.render for EJS, defaults to false
  "cjs": true, // set this to true to use res.render for CJS, defaults to false
  "cjsClient": true, // set this to true to use CJS in the client too, defaults to true if CJS is enabled
  "serverOptions": {}, // this option should only be used for something that catto.js doesn't support
  "expressWsiOptions": {}, // this option should only be used for something that catto.js doesn't support
  "storeOptions": {} // this option should only be used for something that catto.js doesn't support
});
```

Once you made a server, you can add routes just like in [ExpressJS](https://npmjs.com/package/express).

```javascript
server.get("/cats", (req, res) => {
  console.log(req.ip); // log user's ip (requires proxies options to be set)

  res.end("Meow!");
}).post("/meow", (req, res) => {
  console.log(req.body.message); // read value from body
  res.header("X-Meow", "accepted"); // custom response header
  res.status(204); // set status code
  res.end();
}).use(() => {
  // Since this is in the end, it can be used as 404 page
  res.status(404);
  res.end("404 page not found!");
});
```

And make sure to run the server and optionally listen for `running` event.

```javascript
server.on("running", () => {
  console.log("Site is online!");
}).run();
```

There's also some extra functions.

```javascript
// Serve static content from a folder
server.static("public");

// Serve static content from a folder on a specific path
server.static("assets", "/assets");

// FA stands for fast answer
server.get("/ping", cattojs.Server.fa("Pong!"));
```
