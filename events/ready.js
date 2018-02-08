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

        // Set client properties
        this.client.guild = this.client.guilds.get(this.client.config.guild);

        try {
            // Fetch reboot info
        const reboot = JSON.parse(readFileSync("restart.json"));
        // Fetch reboot message
        const message = await this.client.channels.get(reboot.channel).messages.fetch(reboot.id);
        // Update reboot timestamp
        message.edit(`✅ | Successfully rebooted in ${Date.now() - reboot.time}ms.`);
        } catch (e) {
            return null;
        }
    }
};
