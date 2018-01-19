const Base = require("../../base/Command.js");

module.exports = class Suggest extends Base {
    constructor(client) {
        super(client, {
            name: "suggest",
            description: "Please use the forums. (http://www.mcdiamondfire.com/forum)",
            usage: "",
            category: "information",
            aliases: ["bug"],
            permLevel: 0 
        });
    }

    run() {
        super.respond(`Post your suggestions and bugs on the forums. (http://www.mcdiamondfire.com/forum)`);
    }
};
