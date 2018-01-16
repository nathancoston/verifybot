const { MessageEmbed } = require("discord.js");
const ms = require("pretty-ms");
const Base = require("../../base/Command");

module.exports = class Queue extends Base {
    constructor(client) {
        super(client, {
            name: "queue",
            description: "Shows the current support queue.",
            usage: "",
            category: "support",
            permLevel: 2
        });
    }

    async run(message) {
        // Fetch queue data
        const queue = await this.client.query(`SELECT * FROM support_queue;`);

        const data = [
            {
                color: [67, 181, 129],
                status: "Queue Empty",
                details: "The queue is currently empty.",
                min: 0
            },
            {
               color: [52, 152, 219],
               status: "Queue Small",
               details: "There is currently one player in queue.",
               min: 1
            },
            {
                color: [241, 196, 15],
                status: "Queue Busy",
                details: "There are currently {{count}} players in queue.",
                min: 3
            },
            {
                color: [181, 67, 67],
                status: "Queue Critical",
                details: "There are currently {{count}} players in queue! Please help if possible.",
                min: 5
            }
        ];

        // Create a new embed
        const embed = new MessageEmbed()
            .setFooter("DiamondFire Support Queue")
            .setTimestamp();

        // Find queue status
        let status = data[0];
        data.forEach(s => {
            if (queue.length >= s.min) status = s;
        });

        //
        const spacing = queue.map(c => c.player).reduce((out, p) => Math.max(p.length, out), 1);
        let players = [];

        if (queue.length >= 1) {
            players = queue.map((entry, index) => {
                const pos = index >= 9 ? index + 1 : `0${index + 1}`;
                const duration = new Date() - entry.enter_time;
                return `= ${pos}\n${entry.player + " ".repeat(spacing - entry.player.length)} :: Waited ${ms(duration, { secDecimalDigits: 0 })}`;
            });
        }

        players = players.length === 0 ? "" : `\`\`\`asciidoc\n${players.join("\n")}\`\`\``;

        // Define embed fields
        embed.setColor(status.color);
        embed.setAuthor(status.status);
        embed.setDescription(status.details.replace(/{{count}}/g, queue.length) + players);

        message.channel.send({ embed });
    }
};
