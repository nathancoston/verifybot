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

    /**
     * Fetches a user from a mention
     * @param {String} user A user mention in the form of a string
     * @returns {Promise<User>} The user mentioned 
     */
    verifyUser(user) {
        return new Promise((resolve, reject) => {
            // Match the user mention
            const match = /(?:<@!?)?(\d{15,21})?/ig.exec(user);
            // If no match returned, throw an error
            if (!match) return reject("Unable to match provided mention.");
            
            // Fetch the ID from the match
            const id = match[1];
            // Return the fetched user
            resolve(this.client.fetchUser(id));
        });
    }

    /**
     * Throws an error
     * @param {String} content The content of the error
     * @returns {Promise<Message>} The message sent 
     */
    error(content) {
        return this.message.channel.send(`${this.message.author} | ❌ | ${content}`).then(m => m.delete({ timeout: 15000 }));
    }

    /**
     * Responds to the command
     * @param {String} content The content of a message
     * @returns {Promise<Message>} The message sent
     */
    respond(content, options = { showCheck: true }) {
        return this.message.channel.send(`${this.message.author} |${options.showCheck ? " ✅ |" : ""} ${content}`).then(m => m.delete({ timeout: 15000 }));
    }

    /**
     * Returns an "s" if size is greater than 1, or an empty string if not
     * @param {Number} size The size of the item
     * @returns {String}
     */
    s(size) {
        return size === 1 ? "" : "s";
    }

    /**
     * Fetches the command's required permission level
     * @returns {PermLevel} The command's required permission level
     */
    get permLevel() {
        return perms.find(p => p.level === this.conf.level) || perms[0];
    }
}

module.exports = Command;
