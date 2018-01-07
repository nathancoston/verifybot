const Client = require("./base/Client");

const client = new Client({ fetchAllMembers: true, disableEveryone: true, disabledEvents: ["USER_UPDATE", "TYPING_START"] })
    .setConfig("./config.json")
    .loadCommands(`./commands`)
    .loadEvents(`./events`);

client.start(client.config.credentials.token);
client.sql(client.config.credentials.mysql.user, client.config.credentials.mysql.pass, client.config.credentials.mysql.db);
