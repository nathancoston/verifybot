const config = require("../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        // Fetch logs channel
        const logs = config.logs.deleted;
        // If no logs channel found, return false
        if (!logs) return false;

        // Create a new embed
        const embed = new MessageEmbed()
            .setColor(0xFF0000)
            .setAuthor(message.author.displayName)
            .setTitle(`Deleted message in ${message.channel}.`)
            .setDescription(message.content)
            .setImage(message.attachments.size > 0 ? message.attachments.first().url : null);

        // Send the created embed
        logs.send(embed);
    }
};
