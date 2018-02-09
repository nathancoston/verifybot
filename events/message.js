const levels = require("../levels.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        // Ignore if sender is bot, there is no prefix, or if guild is invalid
        if (message.author.bot || !message.guild || this.client.config.guild !== message.guild.id || message.content.indexOf(this.client.config.prefix) === -1) return;

        // Calculate permissions
        const userPerms = await this.client.permLevel(message.author.id);

        // Fetch command name and arguments
        const args = message.content.split(/\s+/g);
        const command = args.shift().slice(this.client.config.prefix.length);
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

        if (!cmd) return;

        // Check if user is on cooldown
        if (cmd.cooldown.has(message.author.id)) return;

        // Message flags
        message.flags = args.filter(arg => arg.indexOf("-") === 0).map(arg => { //eslint-disable-line no-param-reassign
            const index = args.indexOf(arg);
            args.splice(index, 1);
            return { flag: arg.slice(1), arg: args[index] };
        });

        // Delete message containing command
        message.delete();
        // Define command message
        cmd.message = message;

        // Throw error is permissions are too low
        if (userPerms.level < cmd.conf.level) return cmd.error(`Your permission level is too low to execute this command. You are permission level \`${userPerms.level}\` (**${userPerms.name}**) and this command required level \`${cmd.conf.level}\` (**${levels.perms.find(p => p.level === cmd.conf.level).name}**).`);

        // Run command
        cmd.run(message, args, userPerms);

        // Put the user on cooldown
        if (userPerms.level < 4) cmd.startCooldown(message.author.id);
    }
};
