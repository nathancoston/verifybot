const ms = require("pretty-ms");
const Base = require("../../base/Command.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "mute",
            description: "Mutes the selected user.",
            usage: "<user> [time] [-noreports]",
            category: "administrative",
            permLevel: 4
        });
    }

    async run(message, args) {
        // Fetch the mentioned user
        const user = await super.verifyUser(args.shift());
        // Get all time markers
        let time = this.matchAll(/(\d+)([d,h,m,s])/ig, args.join(" "));

        // If user is invalid, throw error
        if (!user) return super.error("Invalid user.");
        // Fetch the user as a guild member
        const member = message.guild.member(user);

        // Calculate time in ms
        time = time.reduce((total, current) => {
            const key = {
                d: 86400000,
                h: 3600000,
                m: 60000,
                s: 1000
            };
            
            return total + key[current[2]] * current[1]; //eslint-disable-line no-mixed-operators
        }, 0);

        // If duration is invalid, throw an error
        if (!time && isNaN(time)) return super.error("Invalid duration.");

        // Fetch the role
        const role = message.guild.roles.find("name", message.flags.find(f => f.flag === "noreports") ? "no-reports" : "Muted");
        // Give the target the role
        member.roles.add(role);

        // Tell the admin that the user has been muted
        super.respond(`${user.tag} has been muted${time ? ` for ${ms(time, { verbose: true })}` : ""}.`);

        if (time) {
            this.client.mutes.set(user.id, setTimeout(() => {
                member.roles.remove(role);        
            }, time));
        }
    }

    matchAll(regex, str) {
        const res = [];
        let m;

        if (regex.global) {
            while (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        } else if (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        return res;
    }
};
