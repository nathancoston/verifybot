const ms = require("ms");
const Base = require("../../base/Command.js");

module.exports = class Help extends Base {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Get a full list of commands.",
            usage: "[command]",
            category: "information",
            permLevel: 0
        });
    }

    run(message, args, perms) {
        const commands = this.client.commands.filter(c => c.conf.level <= perms.level);

        if (args.length === 0) {
            const output = [];

            const categories = this.filterRepeats(commands.map(c => c.help.category));
            const spacing = commands.map(c => c.help.name).reduce((out, cmd) => Math.max(cmd.length, out), 1);
        
            categories.forEach(category => {
                const thisCategory = commands.filter(c => c.help.category === category);
                
                output.push(`== ${this.toTitleCase(category)}\n${thisCategory.map(c => `${c.help.name + " ".repeat(spacing - c.help.name.length)} :: ${c.help.description}`).join("\n")}`);
            });

            message.author.send(`[ Commands ]\n\n${output.join("\n\n")}`, { code: "asciidoc" }).catch(() => super.error("You are blocking direct messages."));
        } else {
            const command = commands.find(c => c.help.name === args[0].toLowerCase());
            if (!command) return super.error("Unknown command.");

            message.author.send({ embed: {
                color: 16777215,
                title: `${command.help.name} ${command.help.usage}`,
                description: command.help.description,
                fields: [
                    {
                        name: "» Permission Level",
                        value: `${command.conf.level} (\`${command.permLevel.name}\`)`,
                        inline: true
                    },
                    {
                        name: "» Category",
                        value: this.toTitleCase(command.help.category),
                        inline: true
                    },
                    {
                        name: "» Aliases",
                        value: command.conf.aliases.length > 0 ? command.conf.aliases.map(a => this.client.config.prefix + a).join(", ") : "None.",
                        inline: true
                    },
                    {
                        name: "» Cooldown",
                        value: ms(command.conf.cooldown, { long: true }),
                        inline: true
                    },
                    {
                        name: "» Staff Only",
                        value: command.conf.level > 2 ? "Yes." : "No.",
                        inline: true
                    }
                ]
            } }).catch(console.log);
        }
    }

    filterRepeats(array) {
        return Array.from(new Set(array));
    }

    toTitleCase(string) {
        return string.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
};
