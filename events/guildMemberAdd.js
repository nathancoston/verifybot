const { MessageEmbed } = require("discord.js");
const config = require("../config.json");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        // Find the joins channel
        const channel = member.guild.channels.find("name", config.logs.joins);
        // If no channel found, return
        if (!channel) return;
        
        // Create a new embed
        const embed = new MessageEmbed()
            .setColor([100, 255, 100])
            .setAuthor(member.user.tag, member.user.avatarURL())
            .setDescription();
    }
};
