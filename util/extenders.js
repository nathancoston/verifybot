const { TextChannel, DMChannel, MessageEmbed } = require("discord.js");

TextChannel.prototype.buildEmbed = DMChannel.prototype.buildEmbed = function (data) {
    return Object.defineProperty(new MessageEmbed({ ...data, timestamp: data.timestamp ? new Date() : null } || {}), "channel", { value: this });
};

MessageEmbed.prototype.send = function (options = {}) {
    if (!this.channel || !(this.channel instanceof TextChannel || this.channel instanceof DMChannel)) return Promise.reject("Invalid channel.");
    this.channel.send(options.content || "", { embed: this, ...options });
};
