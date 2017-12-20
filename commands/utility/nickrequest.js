const Base = require("../../base/Command.js");
const { escapeMarkdown } = require("discord.js");

module.exports = class Nickrequest extends Base {
    constructor(client) {
        super(client, {
            name: "nickrequest",
            description: "Request a nickname change.",
            extended: "Request a nickname change. The requested nickname will be sent to administrators for approval.",
            usage: "<nickname>",
            category: "utility",
            permLevel: 1
        });
    }

    run(message, args) {
        const nickname = args[0];

        if (!nickname) return super.error("No nickname specified.");
        if (nickname.length > 32 || nickname.length < 3) return super.error("Your nickname must be between 3 and 32 characters long.");

        this.client.connection.query(`SELECT nickname_pending FROM linked_accounts WHERE discord_id = '${message.author.id}';`, (err, fields) => {
            if (err || !fields) return super.error("Unable to fetch your profile data.");

            const data = fields[0];
            
            if (data.nickname_pending === 1) return super.respond("You already have a nickname suggestion pending.");

            this.client.log(`**${message.member.nickname || message.author.username}** has requested a nickname change to \`${escapeMarkdown(nickname)}\`. React with ✅ to accept or ❌ to deny.`, this.client.config.webhooks.nickrequests).then(async sent => {
                const m = await this.client.channels.get(sent.channel_id).messages.fetch(sent.id);
    
                await m.react("✅");
                await m.react("❌");

                const nicknameClean = await super.cleanSQL(nickname);
                console.log(nicknameClean, await super.parseCleanSQL(nicknameClean));

                //this.client.connection.query(`UPDATE linked_accounts SET `);
            }).catch(console.log);
        });
    }
};
