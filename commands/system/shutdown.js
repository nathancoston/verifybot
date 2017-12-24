const Base = require("../../base/Command.js");

module.exports = class Shutdown extends Base {
    constructor(client) {
        super(client, {
            name: "shutdown",
            description: "Shut the bot down.",
            category: "system",
            permLevel: 10
        });
    }

    run(message) {
        super.respond("Shutting down...").then(() => {
            this.client.log(`Status Update`, `${message.author.tag} has shut down ${this.client.user.tag}.`).then(() => process.exit());
        });
    }
};
