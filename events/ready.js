module.exports = class {
    constructor(client) {
        this.client = client;
    }

    run() {
        if (parseInt(process.version.split(".")[0]) < 8) throw new Error("Your node version is too low, meaning VerifyBot will not function. Please update node if possible.");
        console.log(`${this.client.user.tag} has booted up successfully. You are currently running node version ${process.version}.`);

        require("../dashboard/dashboard")(this.client); //eslint-disable-line global-require

        this.client.loop();
    }
};
