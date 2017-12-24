const Base = require("../../base/Command.js");

module.exports = class Help extends Base {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Get a full list of commands.",
            usage: "[--filter]",
            category: "information",
            permLevel: 0
        });
    }

    run(message, args, perms) {
        let commands = this.client.commands.map(c => new c());
        if (args[0] === "--filter") commands = commands.filter(c => c.conf.permLevel <= perms.level);

        const output = [];

        const categories = this.filterRepeats(commands.map(c => c.help.category));
        const spacing = commands.map(c => c.help.name).reduce((out, cmd) => Math.max(cmd.length, out), 1);
        
        categories.forEach(category => {
            const thisCategory = commands.filter(c => c.help.category === category);
            
            output.push(`== ${this.toTitleCase(category)}\n${thisCategory.map(c => `${c.help.name + " ".repeat(spacing - c.help.name.length)} :: ${c.help.description}`).join("\n")}`);
        });

        message.author.send(`[ Commands ]\n\n${output.join("\n\n")}`, {code: "asciidoc"}).catch(() => super.error("You are blocking direct messages."));
    }

    filterRepeats(array) {
        return Array.from(new Set(array));
    }

    toTitleCase(string) {
        return string.split(/\s+/g).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    }
};
