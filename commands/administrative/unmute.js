const ms = require("pretty-ms");
const Base = require("../../base/Command.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "unmute",
            description: "Unmutes the selected user.",
            usage: "<user>[-noreports]",
            category: "administrative",
            permLevel: 3
        });
    }

    async run(message, args) {
        const user = await super.verifyUser(args.shift());
        if (!user) return super.error("Invalid user.");

        const member = message.guild.member(user);
        const role = message.guild.roles.find("name", message.flags.includes("noreports") ? "no-reports" : "Muted");
        member.removeRole(role);

        super.respond(`${user.tag} has been unmuted.`);
    }
};
