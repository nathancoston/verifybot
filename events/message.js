const levels = require("../levels.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        // Ignore if sender is bot, user is on cooldown, or if guild is invalid
        if (message.author.bot || !message.guild || this.client.config.guild !== message.guild.id || this.client.commandCooldowns.has(message.author.id)) return;

        // Calculate permissions
        const userPerms = await this.client.permLevel(message.author.id);

        // Fetch command name and arguments
        const args = message.content.split(/\s+/g);
        const command = args.shift().slice(this.client.config.prefix.length);

        let cmd;

        // Find command
        if (this.client.commands.has(command)) {
            cmd = this.client.commands.get(command);
        } else if (this.client.aliases.has(command)) cmd = this.client.commands.get(this.client.aliases.get(command));

        if (!cmd) return;

        // Message flags
        message.flags = []; //eslint-disable-line no-param-reassign
        while (args[0] && args[0][0] === "-") message.flags.push(args.shift().slice(1));

        // Delete message containing command
        message.delete();
        // Define command message
        cmd.message = message;

        // Throw error is permissions are too low
        if (userPerms.level < cmd.conf.level) return cmd.error(`Your permission level is too low to execute this command. You are permission level \`${userPerms.level}\` (**${userPerms.name}**) and this command required level \`${cmd.conf.level}\` (**${levels.perms.find(p => p.level === cmd.conf.level).name}**).`);

        // Run command
        cmd.run(message, args, userPerms);

        // Put the user on cooldown
        if (cmd.conf.cooldown > 0) {
            this.client.commandCooldowns.add(message.author.id);

            setTimeout(() => {
                this.client.commandCooldowns.delete(message.author.id);
            }, cmd.conf.cooldown);
        }
    }
};
