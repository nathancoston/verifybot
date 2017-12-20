const Base = require("./Command");

class ModCommand extends Base { //eslint-disable-line no-unused-vars
    constructor(client, options) {
        super(client, Object.assign(options, {
            category: "moderation",
            permLevel: 4
        }));

        this.actions = {
            wa: {color: "#FF0000", display: "Warn"},
            ki: {color: "#FF9900", display: "Mute"},
            sb: {color: "#FF3300", display: "Softban"},
            ba: {color: "#FF0000", display: "Ban"},
            ub: {color: "#009966", display: "Unban"}
        }
    }

    check(message, args, perms) {
        return this.verifyUser(args[0]).then(user => {
            const member = message.guild.fetchMember(user.id);
            
            if (!member) return super.error("Unknown user. Please mention the user that you are attempting to target.");
            if (user.id === message.author.id) return super.error(`You cannot perform this action on yourself.`);
            if (member.highestRole.position >= message.member.highestRole.position) return super.error(`You are unable to perform this action on this user.`);
        }).catch(() => super.error("Unknown user. Please mention the user that you are attemting to target."));
    }
}