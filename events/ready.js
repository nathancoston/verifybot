const { readFileSync } = require("fs");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        // Check node version
        if (parseInt(process.version.split(".")[0]) < 8) throw new Error("Your node version is too low, meaning VerifyBot will not function. Please update node if possible.");
        // Inform user that connection to websocket has been made
        console.log(`${this.client.user.tag} has booted up successfully.`);

        // Activate dashboard
        require("../dashboard/dashboard")(this.client); //eslint-disable-line global-require

        // Set the bot's game
        this.client.user.setActivity("www.mcdiamondfire.com");
        // Run the 15 minute loop to update users' nicknames
        this.client.loop();

        // Fetch reboot info
        const reboot = JSON.parse(readFileSync("restart.json"));
        // Fetch reboot message
        const message = await this.client.channels.get(reboot.channel).messages.fetch(reboot.id);
        // Edit to get time
        await message.edit("Fetching...");
        // Update reboot timestamp
        message.edit(`✅ | Successfully rebooted in ${message.editedTimestamp - message.createdTimestamp}ms.`);
    }
};
