const Base = require("../../base/Command");

module.exports = class Sql extends Base {
    constructor(client) {
        super(client, {
            name: "sql",
            description: "Evaluates sql code",
            usage: "<sql code>",
            category: "system",
            permLevel: 10,
            aliases: ["mysql"]
        });
    }

    async run(message, args) {
        this.client.query(args.join(" ")).then(results => {
            message.channel.send(`== ${args.join(" ")}\n\n${results.map(r => {
                const spacing = Object.keys(r).reduce((out, key) => Math.max(out, key.length), 0);
                return Object.entries(r).map(data => `${data[0] + " ".repeat(spacing - data[0].length)} :: ${data[1]}`).join("\n");
            }).join("\n\n")}`, { code: "asciidoc" });
        }).catch(err => {
            message.channel.send(`SQL Error\n\`\`\`${err}\`\`\``);
        });
    }
};
