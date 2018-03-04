const ms = require("pretty-ms");
const Base = require("../../base/Command");
const fetchSupportData = require("../../methods/restricted/fetchSupportData");

module.exports = class Stats extends Base {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Shows your support statistics.",
            usage: "",
            category: "support",
            permLevel: 2
        });
    }

    async run(message) {
        // Fetch support data
        const data = await fetchSupportData(this.client, message.author.id);
        // If no data returned, throw an error
        if (!data || !data.sessions[0]) return super.error(`You have not completed any sessions.`);

        // message.channel.send([
        //     "**__Support Statistics__**",
        //     `**${data.sessions.length}** total sessions.`,
        //     `**${data.month.length}** sessions this month.`,
        //     `**${** individual players helped.`,
        //     `**${ms(data.sessions.reduce((t, s) => t += s.duration, 0), { verbose: true, secDecimalDigits: 0 })}** of session time.` //eslint-disable-line
        // ].join("\n"));

        message.channel.buildEmbed(this.client.config.embedTemplate)
            .setAuthor(message.author.tag, message.author.avatarURL({ size: 64 }))
            .setTitle("Support Statistics")
            .addField("» Total Sessions", data.sessions.length)
            .addField("» Sessions this Month", data.month.length)
            .addField("» Individual Players Helped", Array.from(new Set(data.sessions.map(s => s.name))).length)
            .addField("» Total Session Time", ms(data.sessions.reduce((t, s) => t += s.duration, 0), { verbose: true, secDecimalDigits: 0 })) //eslint-disable-line
            .send();
    }
};
