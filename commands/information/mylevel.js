const Base = require("../../base/Command.js");

module.exports = class MyLevel extends Base {
    constructor(client) {
        super(client, {
            name: "mylevel",
            description: "See your permission level.",
            extended: "View your user permission level. This level is what access level you have to certain commands.",
            category: "information",
            permLevel: 0 
        });
    }

    run(message, args, perms) {
        super.respond(`You are permission level \`${perms.level}\` (**${perms.name}**).`);
    }
};
