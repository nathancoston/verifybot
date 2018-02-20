const { MessageEmbed } = require("discord.js");
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
        const embed = new MessageEmbed()
            .setColor(0xFFFFFF)
            .setThumbnail(this.client.user.avatarURL({ size: 128 }))
            .setAuthor("Credits")
            .setDescription("VerifyBot was developed by these 2 users:")
            .addField("» RedstoneDaedalus#2020 (268071134057070592)", "Bot Developer")
            .addField("» Jeremaster#3655", "Minecraft Server Developer")
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        message.channel.send({ embed });
    }
};
