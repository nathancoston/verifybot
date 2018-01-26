const ms = require("pretty-ms");
const Base = require("../../base/Command.js");

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: "mute",
            description: "Mutes the selected user.",
            usage: "<user> [time] [-noreports]",
            category: "administrative",
            permLevel: 3
        });
    }

    async run(message, args) {
        const user = await super.verifyUser(args.shift());
        let time = this.matchAll(/(\d+)([d,h,m,s])/ig, args.join(" "));

        if (!user) return super.error("Invalid user.");
        const member = message.guild.member(user);

        time = time.reduce((total, current) => {
            const key = {
                d: 86400000,
                h: 3600000,
                m: 60000,
                s: 1000
            };

            return total + key[current[2]] * current[1]; //eslint-disable-line no-mixed-operators
        }, 0);

        if (!time && isNaN(time)) return super.error("Invalid duration.");

        const role = message.flags.includes("noreports") ? message.guild.roles.find("name", "no-reports") : message.guild.roles.find("name", "Muted");
        member.addRole(role);

        super.respond(`${user.tag} has been muted${time ? ` for ${ms(time, { verbose: true })}` : ""}.`);

        if (time) {
            this.client.mutes.set(user.id, setTimeout(() => {
                member.removeRole(role);        
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
