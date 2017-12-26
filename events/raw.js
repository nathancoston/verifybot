const star = "⭐";
const { Collection, MessageEmbed } = require("discord.js");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    /*STARBOARD
    Due to how the discord.js library works, this uses the raw event.
    
    DATA STRUCTURE
    +-------------------------------+---------------------+-------------------------------------------+
    |          message_id           |        stars        |                  post_id                  |
    +-------------------------------+---------------------+-------------------------------------------+
    | The ID of the starred message | The amount of stars | The ID of the message sent to #starboard. |
    +-------------------------------+---------------------+-------------------------------------------+
*/

    async run(event) {
        try {
            if (["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(event.t)) {
                const message = await this.client.channels.get(event.d.channel_id).messages.fetch(event.d.message_id);
                if (!message) return;
                const channel = message.guild.channels.find("name", "starboard");
                if (!channel) return;
                const stars = message.reactions.find(r => r.emoji.name === star) || new Collection();
    
                this.client.connection.query(`SELECT * FROM starboard WHERE message_id = '${event.d.message_id}'`, async (err, fields) => {
                    if (err) return console.log(`Error whilst fetching starboard data:\n${err}`);
    
                    if (stars.count >= 5) {
                        if (!fields || fields.length === 0) {
                            const embed = new MessageEmbed()
                            .setColor(16776960)
                            .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                            .setDescription(message.content);
    
                            if (message.attachments.size > 0) embed.setImage(message.attachments.first().url);
    
                            const post = await channel.send(`${star} ${stars.count} in ${message.channel.toString()}`, { embed });
        
                            this.client.connection.query(`INSERT INTO starboard (message_id, post_id, stars) VALUES ('${message.id}', '${post.id}', ${stars.count})`);
                        } else {
                            const embed = new MessageEmbed()
                            .setColor(16776960)
                            .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                            .setDescription(message.content);
    
                            if (message.attachments.size > 0) embed.setImage(message.attachments.first().url);
    
                            try {
                                const post = await channel.messages.fetch(fields[0].post_id);
                                post.edit(`${star} ${stars.count} in ${message.channel.toString()}`, { embed });
                            } catch (e) {
                                return;
                            }
    
                            this.client.connection.query(`UPDATE starboard SET stars = ${stars.count} WHERE message_id = '${message.id}';`);
                        }
                    } else {
                        try {
                            const post = await channel.messages.fetch(fields[0].post_id);
                            post.delete();
                        } catch (e) {
                            return;
                        }
    
                        this.client.connection.query(`DELETE FROM starboard WHERE message_id = '${message.id}';`);
                    }
                });
            }
        } catch (e) {
            console.log(`Starboard error:\n${e}`);
        }
    }
};
