const ms = require("pretty-ms");
const Base = require("../../base/Command");
const fetchSupportData = require("../../methods/restricted/fetchSupportData");

module.exports = class Stats extends Base {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Check a support's stats.",
            usage: "",
            permLevel: 2,
            aliases: ["support"]
        });
    }

    async run(message) {
        // Fetch support data
        const data = await fetchSupportData(this.client, message.author.id);
        // If no data returned, throw an error
        if (!data) return super.error(`You have not completed any sessions.`);

        message.channel.send([
            "**__Support Statistics__**",
            `**${data.sessions.length}** total sessions.`,
            `**${Array.from(new Set(data.sessions.map(s => s.name))).length}** individual players helped.`,
            `**${ms(data.sessions.reduce((t, s) => t += s.duration, 0), { verbose: true })}** of session time.`, //eslint-disable-line
            `**${data.sessions.filter(s => new Date(new Date().setDate(new Date().getDate() - 30)) - s.time > 0).length}** sessions this month.`
        ].join("\n"));
    }
};
