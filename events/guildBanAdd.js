const { MessageEmbed } = require("discord.js");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(guild, user) {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: "MEMBER_BAN_ADD" });
        const entry = logs.entries.first();

        if (!entry) return;

        const executor = guild.member(entry.executor);
        if (executor.id === this.client.user.id) return;

        const channel = guild.channels.find("name", this.client.config.logs.modlog);
        if (!channel) return;

        const previous = (await channel.messages.fetch({ limit: 1 })).filter(c => c.author.id === this.client.user.id);
        const caseNumber = (previous.size ? parseInt(previous.first().embeds[0].footer.text.split(" ")[1]) + 1 : 1) || 1;

        const embed = new MessageEmbed()
            .setColor(0xFF0000)
            .setAuthor(`${executor.displayName} (${executor.user.tag})`)
            .setDescription(`**User:** ${user.tag}\n**Action:** ban\n**Reason:** ${entry.reason || `Awaiting moderator's input. Type \`!reason ${caseNumber} <reason>\` to set reason.`}`)
            .setFooter(`Case ${caseNumber}`)
            .setTimestamp();

        channel.send({ embed });
    }
};
