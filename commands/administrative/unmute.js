const Base = require("../../base/Command.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "unmute",
            description: "Unmutes the selected user.",
            usage: "<user> [-noreports]",
            category: "administrative",
            permLevel: 4
        });
    }

    async run(message, args) {
        // Fetch mentioned user
        const user = await super.verifyUser(args.shift());
        // If user is invalid, throw an error
        if (!user) return super.error("Invalid user.");

        // Fetch the guild member
        const member = message.guild.member(user);
        // Fetch the role
        const role = message.guild.roles.find("name", message.flags.find(f => f.flag === "noreports") ? "no-reports" : "Muted");
        // Remove the muted role
        member.roles.remove(role);

        // Tell the admin the user has been unmuted
        super.respond(`${user.tag} has been unmuted.`);
    }
};
