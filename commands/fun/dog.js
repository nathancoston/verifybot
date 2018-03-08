const { get } = require("snekfetch");
const Base = require("../../base/Command.js");

module.exports = class Dog extends Base {
    constructor(client) {
        super(client, {
            name: "dog",
            description: "Shows a random dog from the random.dog website.",
            usage: "",
            category: "fun",
            permLevel: 0,
            aliases: ["doggo", "pup", "pupper", "puppy"],
            cooldown: 60000
        });
    }

    async run(message) {
        message.channel.send(`https://random.dog/${this.pendingDog}`);
        const { text } = await get("https://random.dog/woof");
        this.pendingDog = text;
    }

    async init() {
        const { text } = await get("https://random.dog/woof");
        Object.defineProperty(this, "pendingDog", { value: text, writable: true });
    }
};
