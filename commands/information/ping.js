const Command = require("../../base/Command.js");

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Get the bot's response time.",
            extended: "This command will give you the bot's exact response time in milleseconds.",
            category: "information",
            permLevel: 0
        });
    }

    run(message) {
        super.respond(`Command execution time is \`${message.createdAt - Date.now()}ms\`.`);
    }
};
