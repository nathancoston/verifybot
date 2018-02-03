const Base = require("../../base/Command");

module.exports = class Clear extends Base {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clears a large amount of messages at once",
            usage: "[user] [amount]"
        });
    }

    async run(message, args) {
        const user = (this.verifyUser(args[0]));
        const amount = user ? parseInt(message.content.split(" ")[2], 10) : parseInt(message.content.split(" ")[1], 10);

        if (!amount) return super.error("Invalid amount.");
        if (!amount && !user) return super.error("Must specify a user and amount, or just an amount, of messages to purge!");
        
        let messages = await message.channel.messages.fetch({
            limit: 100
        });
        if (user) {
        messages = messages.filter(m => m.author.id === user.id);
        }
        message.channel.bulkDelete(messages, true).then((deleted) => {
            if (deleted.size === 0) return super.error("No messages deleted.");
            super.respond(`Deleted ${deleted.size} message${this.s(deleted.size)}.`);
        }).catch(() => super.error("An error occured whilst attempting to delete the messages."));
    }
};
