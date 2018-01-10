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
        // Fetch a list of commands that the user can use
        const commands = this.client.commands.filter(c => c.conf.level <= perms.level);
        const aliases = this.client.aliases.filter((alias, command) => commands.has(command));

        // Send full help list
        if (args.length === 0) {
            const output = [];

            // Fetch categories
            const categories = this.filterRepeats(commands.map(c => c.help.category));
            //Calculate spacing required to make commands evenly spaced
            const spacing = commands.map(c => c.help.name).reduce((out, cmd) => Math.max(cmd.length, out), 1);
        
            // Load commands for every category
            categories.forEach(category => {
                // Fetch commands in current category
                const thisCategory = commands.filter(c => c.help.category === category);
                // Push result to output
                output.push(`== ${this.toTitleCase(category)}\n${thisCategory.map(c => `${c.help.name + " ".repeat(spacing - c.help.name.length)} :: ${c.help.description}`).join("\n")}`);
            });

            // Send the user the formatted output
            message.author.send(`[ Commands ]\n\n${output.join("\n\n")}`, { code: "asciidoc" });

            // Send specific command help
        } else {
            // Find the command
            const command = commands.find(c => c.help.name === args[0].toLowerCase()) || aliases.get(args[0].toLowerCase());
            // Throw error if command is invalid
            if (!command) return super.error("Unknown command.");

            // Send the user an embed containing command details
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
            } }).then(() => super.resond("Check your direct messages.")).catch(() => super.error("Please enable direct messages to recieve help."));
        }
    }

    // Used to remove multiple instances of the same item in arrays
    filterRepeats(array) {
        return Array.from(new Set(array));
    }

    // Set the first letter of every word to uppercase
    toTitleCase(string) {
        return string.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
};
