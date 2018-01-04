const Base = require("../../base/Command");
const { promisify } = require("util");
const { writeFile } = require("fs");

module.exports = class Restart extends Base {
    constructor(client) {
        super(client, {
            name: "restart",
            description: "Restarts the bot.",
            usage: "",
            aliases: ["reboot"],
            category: "system",
            permLevel: 10
        });
    }

    async run(message) {
        const msg = await message.channel.send(`<a:typing:398270961163436044> | Restarting...`);
        writeFile("restart.json", `{ "id": "${msg.id}", "channel": "${message.channel.id}" }`, () => {
            process.exit(1);
        });
    }
};
