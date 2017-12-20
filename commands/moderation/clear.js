const Base = require("../../base/Command.js");

module.exports = class Clear extends Base {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Deletes a large amount of messages.",
            extended: "Deletes the specified amount of messages. Clear a certain user's messages by mentioning them.",
            usage: "[@user] <number>",
            category: "moderation",
            permLevel: 2
        });
    }

    run() {
        super.error("This command is a WIP.");
    }
};
