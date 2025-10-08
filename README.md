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

### Requests

CattoJS automatically adds `fetch()` function even if your NodeJS version doesn't have it, but CattoJS has own functions to do requests.

```javascript
var { response, body } = cattojs.request.get("https://example.com/");
// Body will automatically be parsed as JSON if possible even without a header
```

### Oracle API

You can make requests to Oracle API using normal fetch.

```javascript
var oci = new cattojs.Oracle({
  "config": "myconfig", // defaults to config
  "profile": "DEFAULT" // defaults to DEFAULT
});

// Just use as normal fetch
var response = await oci.fetch("https://iaas.uk-london-1.oraclecloud.com/20160812/...");
```

### Base64

You can encode/decode Base64 data.

```javascript
var test = cattojs.Base64.encode("meow"); // encoded

// Decode
console.log(cattojs.Base64.decode(test)); // > meow
```

### Discord Bots

### Getting started

You can create a Discord Bot using the `Bot` class.

```javascript
var bot = new cattojs.Bot({
  "token": "Mz...", // your Discord bot token, required
  "intents": 131071, // intents for your bot, bitfield, defaults to 98045 (all non-priveleged intents)
  "apiv": 10, // Discord API version to use, defaults to 10
  "slashListener": true, // if true, catto.js will overwrite your slash commands with the ones you made using .slashCommand and listen for interactions and respond, set to false if you already made the slash commands yourself, defaults to true
  "buttonListener": true, // if true, catto.js will listen for button interactions and respond, set to false if you handle the buttons yourself
  "publicKey": "123", // your public key, required for web interactions
  "debug": false, // enable debug mode for extra logs
  "mobile": false, // set mobile status
  "sharded": false, // set to true if your bot is using shards
  "partials": false // set to true to receive partials
});
```

And make sure to run the bot and optionally listen for `running` event to detect when it's online.

```javascript
bot.on("running", () => {
  console.log("Bot is online!");
}).run();
```

### Text commands

```javascript
// Make sure to enable message content intent for normal text commands
bot.command("!test", async ({ Discord, message, cmd, args }) => { // optional variables you can take
  // Message object just like in DiscordJS
  var msg = await message.reply({
    "content": "Meow!"
  });

  // Editing message with adding an embed
  // Discord is just DiscordJS object
  var embed = new Discord.EmbedBuilder();
  embed.setDescription("Test!");
  msg.edit({
    "content": "Meow meow!",
    "embeds": [embed]
  });
});
```

### Slash commands

```javascript
bot.slashCommand({
  "name": "/test", // command itself, must start with slash, required
  "description": "A command just for testing.", // description, required
  "dm": false, // can this command be in direct messages, optional
  "user": false, // can this command be executed anywhere as user-installed bot, optional
  "servers": ["916772281747931198"], // servers where this command will be, defaults to null (all servers)
  "options": [{ // arguments to the slash command
    "type": "string", // argument type (string, integer, bool, user, channel, role, file, number, mentionable), required
    "name": "cat", // argument name, required
    "description": "Type of a cat", // argument description, required
    "required": true, // if the argument is required
    "min": 2, // minimum length for a string or a minimum value for integer/number
    "max": 15, // maximum length for a string or a maximum value for integer/number
    "choices": [{ // if specified, user will be required to choose one of the choices (works with string, integer, number)
      "name": "Siamese Cat",
      "value": "1304"
    }],
    //"types": [0] // types user can choose (for channel)
  }]
}, async ({ interaction }) => { // handler
  interaction.reply({
    "content": "Meow!"
  });
});
```
