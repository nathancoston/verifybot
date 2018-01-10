const Command = require("../../base/Command");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const path = require("path");

module.exports = class Pull extends Command {
    constructor(client) {
        super(client, {
            name: "pull",
            description: "Update code from GitHub repository.",
            usage: "",
            category: "system",
            permLevel: 10
        });
    }

    async run(message) {
        // Execute pull on repository URL
        const { stdout, stderror, error } = await exec(`git pull ${require("../../package.json").repository.url.split("+")[1]}`, { cwd: path.join(__dirname, "../../") });
        // If error thrown, return error message
        if (error) return super.error("An unknown error occured whilst attempting to pull.");

        // Create an empty array to store output.
        const out = [];
        // If output returned, push to output
        if (stdout) out.push(stdout);
        // If error returned, push to output
        if (stderror) out.push(stderror);

        await message.channel.send(out.join("---\n"), { code: true });
        if (!stdout.toString().includes("Already up-to-date.")) this.client.commands.get("restart").run(message);
    }
};
