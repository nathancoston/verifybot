const Command = require("../../base/Command.js");

module.exports = class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "verify",
            description: "Verify your account.",
            extended: "Link your minecraft and discord accounts.",
            category: "information",
            permLevel: 0
        });
    }

    run() {
        super.respond("Please go to the website to verify yourself: http://localhost:4040/verify");
    }
};
