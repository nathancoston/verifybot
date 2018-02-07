const Base = require("../../base/Command.js");

module.exports = class Reason extends Base {
    constructor(client) {
        super(client, {
            name: "reason",
            description: "Changes the reason for a moderation log.",
            usage: "<case> <reason>",
            permLevel: 4
        });
    }
};
