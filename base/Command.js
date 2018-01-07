const { perms } = require("../levels.json");

/**
 * Represents a command.
 */
class Command {
    /**
     * @param {Client} client The client passed to the command.
     * @param {Object} options The properties of the command.
     * @param {String} options.name The name of the command.
     * @param {String} options.description The description of the command.
     * @param {String} options.usage The command usage.
     * @param {String} options.category The category for the cmomand.
     * @param {Number} options.permLevel The permission level required for the command.
     * @param {Number} options.cooldown The cooldown time on a command.
     * @param {Array} options.aliases The command aliases. 
     */
    constructor(client, options) {            
        this.client = client;
        
        this.help = {
            name: options.name || "unset",
            description: options.description || "No description provided.",
            usage: options.usage || "",
            category: options.category || "information"
        };

        this.conf = {
            level: options.permLevel || 0,
            cooldown: options.cooldown || 10000,
            aliases: options.aliases || []
        };

        this.message = null;
    }

    verifyUser(user) {
        return new Promise((resolve, reject) => {
            const match = /(?:<@!?)?([0-9]{17,20})?/ig.exec(user);
            if (!match) return reject("Unable to match provided mention.");
            
            const id = match[1];
            resolve(this.client.fetchUser(id));
        });
    }

    error(content) {
        return this.message.channel.send(`❌ | ${content}`).then(m => m.delete({ timeout: 15000 }));
    }

    respond(content) {
        return this.message.channel.send(`✅ | ${content}`).then(m => m.delete({ timeout: 15000 }));
    }

    s(size) {
        return size === 1 ? "" : "s";
    }

    get permLevel() {
        return perms.find(p => p.level === this.conf.level) || perms[0];
    }
}

module.exports = Command;
