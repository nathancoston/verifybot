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
        // Fetch commands the user has access to
        const commands = this.client.commands.filter(command => command.conf.level <= perms.level);
        // Fetch command categories
        const categories = Array.from(new Set(commands.map(command => command.help.category)));
        // Fetch highest command length
        const spacing = commands.map(c => c.help.name).reduce((out, command) => Math.max(command.length, out), 1);
        
        // If argument is a valid category...
        if (categories.length > 1 && categories.includes(args[0])) {
            // Fetch the category
            const category = categories.find(c => c === args[0]);
            // Fetch commands within the category
            const targets = commands.filter(command => command.help.category === category);

            // Send the user a list of the commands in that category
            message.channel.send({ embed: {
                title: `Command Category: \`${category}\``,
                description: targets.map(command => `\`${command.help.name}\`\n${command.help.description}\nUsage: \`!${command.help.name} ${command.help.usage}\``).join("\n")
            } });

            return;
        }

        // If argument is a valid command...
        if (categories.length > 1 && commands.exists(command => command.help.name === args[0])) {
            // Fetch the command
            const command = commands.find(cmd => cmd.help.name === args[0]);

            // Send the user the command data
            message.channel.send({ embed: {
                title: `Command Help: ${command.help.name}`,
                description: `\`[param]\` - Optional\n\`<parm>\` - Required\n**» Description**\n${command.help.description}\n**» Usage**\n!${command.help.name} ${command.help.usage}\n**» Permission Level**\n${command.conf.level} (${command.permLevel.name})`
            } });

            return;
        }

        // If user only has access to 1 category...
        if (categories.length === 1) {
            // Send the user a list of all commands
            message.channel.send({ embed: {
                title: "Commands List",
                description: commands.map(command => `\`${command.help.name + " ".repeat(spacing - command.help.name.length)}|\` ${command.help.description}`).join("\n")
            } });
        // If user has access to more than 1 category...
        } else {
            message.channel.send({ embed: {
                title: "Commands List",
                description: `**Pick from one of the following categories:**\n${categories.map(category => `!help ${category}`).join("\n")}`
            } });
        }
    }
};
