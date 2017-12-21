const levels = require("../levels.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        /* Run checks */
        if (message.author.bot || !message.guild || this.client.config.guild !== message.guild.id) return;

        /* Permissions */
        const userPerms = await this.client.permLevel(message.author.id);

        /* Command arguments */
        const args = message.content.split(/\s+/g);
        const command = args.shift().slice(this.client.config.prefix.length);

        let cmd;

        if (this.client.commands.has(command)) {
            cmd = this.client.commands.get(command);
        } else if (this.client.aliases.has(command)) cmd = this.client.commands.get(this.client.aliases.get(command));

        if (!cmd) return;

        message.delete();
        cmd.message = message;

        if (this.client.commandCooldowns.has(message.author.id)) return;

        if (userPerms.level < cmd.conf.level) return cmd.error(`Your permission level is too low to execute this command. You are permission level \`${userPerms.level}\` (**${userPerms.name}**) and this command required level \`${cmd.conf.level}\` (**${levels.perms.find(p => p.level == cmd.conf.level).name}**).`);

        cmd.run(message, args, userPerms);

        if (cmd.conf.cooldown > 0) {
            this.client.commandCooldowns.add(message.author.id);

            setTimeout(() => {
                this.client.commandCooldowns.delete(message.author.id);
            }, cmd.conf.cooldown);
        }
    }
};
