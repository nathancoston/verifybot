module.exports = class Base {
    constructor(client, options) {            
        this.client = client;
        
        this.help = {
            name: options.name || "unset",
            description: options.description || "No description provided.",
            extended: options.extended || "No description provided.",
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
};
