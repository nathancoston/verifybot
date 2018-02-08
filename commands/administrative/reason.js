const Base = require("../../base/Command.js");

module.exports = class Reason extends Base {
    constructor(client) {
        super(client, {
            name: "reason",
            description: "Changes the reason for a moderation log.",
            usage: "<case> <reason>",
            permLevel: 4
        });
    }

    async run(message, args) {
        try {
            // Fetch the modlogs channel
            const channel = message.guild.channels.find("name", this.client.config.logs.modlog);
            // If there is no modlog channel, throw an error
            if (!channel) return super.error("No modlog channel found.");
            // Fetch 100 messages
            const messages = await channel.messages.fetch({ limit: 100 });
            // Fetch the case
            const log = messages.find(c => c.author.bot && c.embeds[0].footer.text.split(" ")[1] === args[0]);
            // If no case found, throw an error
            if (!log) return super.error("Case not found. Please note that I am unable to edit cases that happened over 100 logs ago.");
           
            // Fetch the case embed
            const embed = log.embeds[0];
            // Create new embed data
            const data = embed.description.split("\n").slice(0, 2);
            // Push the reason into the new array
            data.push(`**Reason:** ${args.slice(1).join(" ")}`);
            // Set the embed's description to the new data
            embed.description = data.join("\n");
            // Edit the message
            log.edit(embed);
        } catch (e) {
            super.error("An unknown error occured whilst attempting to perform this action.");
        }
    }
};
