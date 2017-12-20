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
            cooldown: options.cooldown || 0,
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

    cleanSQL(string) {
        return new Promise((resolve, reject) => {
            const symbols = string.match(/[';()-]/ig);
            const containsIllegal = /&<%\d{1,2}%>/ig.test(string);
            let cleaned = string;
            
            if (symbols && containsIllegal) return reject("String contains characters used for cleaning.");
            
            if (symbols) {
                console.log(symbols);
                symbols.forEach((s, i) => {
                    console.log(new RegExp(s, "ig"));
                    console.log(symbols[i + 1]);
                    //cleaned = cleaned.replace(new RegExp(s, "g"), `&<%${s.charCodeAt(0)}%>`);
                });
            }
            
            return resolve(cleaned);
        });
    }

    parseCleanSQL(string) {
        return new Promise((resolve) => {
            const matches = string.match(/&<%\d{1,2}%>/ig);
            let cleaned = string;

            if (matches) {
                matches.forEach(match => {
                    const code = parseInt(/\d{1,2}/ig.exec(match));
                    cleaned = cleaned.replace(new RegExp(match, "ig"), String.fromCharCode(code));
                });
            }

            return resolve(string);
        });
    }

    error(content) {
        return this.message.channel.send(`❌ | ${content}`).then(m => m.delete({ timeout: 15000 }));
    }

    respond(content) {
        return this.message.channel.send(`✅ | ${content}`).then(m => m.delete({ timeout: 15000 }));
    }
};
