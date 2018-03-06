const ms = require("pretty-ms");
const Base = require("../../base/Command");
const fetchSupportData = require("../../methods/restricted/fetchSupportData");

module.exports = class Stats extends Base {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Shows your support statistics.",
            usage: "[user]",
            category: "support",
            permLevel: 2
        });
    }

    async run(message, args) {
        // Fetch target
        const target = await super.verifyUser(args[0]) || message.author;
        // Fetch support data
        const data = await fetchSupportData(this.client, target.id);
        // If no data returned, throw an error
        if (!data || !data.sessions[0]) return super.error(`${target.id === message.author.id ? "You have" : "The specified user has"} not completed any sessions.`);

        message.channel.buildEmbed(this.client.config.embedTemplate)
            .setAuthor(target.tag, target.avatarURL({ size: 64 }))
            .setTitle("Support Statistics")
            .addField("» Total Sessions", data.sessions.length)
            .addField("» Sessions this Month", data.month.length)
            .addField("» Individual Players Helped", Array.from(new Set(data.sessions.map(s => s.name))).length)
            .addField("» Total Session Time", ms(data.sessions.reduce((t, s) => t += s.duration, 0), { verbose: true, secDecimalDigits: 0 })) //eslint-disable-line
            .send();
    }
};
