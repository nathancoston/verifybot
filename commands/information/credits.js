const Base = require("../../base/Command.js");

module.exports = class Credits extends Base {
    constructor(client) {
        super(client, {
            name: "credits",
            description: "Lists the bot's credits.",
            usage: "",
            category: "information",
            permLevel: 0
        });
    }

    run(message) {
        // Create a new embed
        const embed = message.channel.buildEmbed(this.client.config.embedTemplate)
            .setThumbnail(this.client.user.avatarURL({ size: 128 }))
            .setAuthor("Credits")
            .setDescription("VerifyBot was developed by these 2 users:")
            .addField("» RedstoneDaedalus#2020 (268071134057070592)", "Bot Developer")
            .addField("» Jeremaster#3655 (180506843796209664)", "Minecraft Server Developer");

        embed.send();
    }
};
