// Import custom client
const Client = require("./base/Client");
// Load extenders
require("./util/extenders");

// Initialize client, attach config to config.json, set command directory to /commands, and set events directory to /events
const client = new Client({ fetchAllMembers: true, disableEveryone: true, disabledEvents: ["USER_UPDATE", "TYPING_START"] })
    .setConfig("./config.json")
    .loadCommands(`./commands`)
    .loadEvents(`./events`);

// Start client with token found in config
client.start(client.config.credentials.token);
// Conect to mysql database
client.sql(client.config.credentials.mysql.user, client.config.credentials.mysql.pass, client.config.credentials.mysql.db);
