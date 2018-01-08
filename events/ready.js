const { readFileSync } = require("fs");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        if (parseInt(process.version.split(".")[0]) < 8) throw new Error("Your node version is too low, meaning VerifyBot will not function. Please update node if possible.");
        console.log(`${this.client.user.tag} has booted up successfully. You are currently running node version ${process.version}.`);

        require("../dashboard/dashboard")(this.client); //eslint-disable-line global-require

        this.client.user.setActivity("www.mcdiamondfire.com");
        this.client.loop();
        
        const reboot = JSON.parse(readFileSync("restart.json"));
        const message = await this.client.channels.get(reboot.channel).messages.fetch(reboot.id);
        message.edit(`✅ | Successfully rebooted in ${Date.now() - message.createdTimestamp}ms.`);
    }
};
