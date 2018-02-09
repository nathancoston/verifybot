const { MessageEmbed } = require("discord.js");
const Command = require("./Command");

/** 
 * Represents a moderation command
*/
class ModerationCommand extends Command {
    /**
     * @param {Client} client The client passed to the command
     * @param {Object} options The properties of the command
     * @param {Object} logOptions The properties of the moderation log
     * @param {Color} logOptions.color The color for the moderation log
     * @param {String} logOptions.action The name of the action
     */
    constructor(client, options, logOptions) {
        super(client, options);

        this.client = client;
        this.color = logOptions.color;
        this.actionName = logOptions.actionName;
        this.executor = null;
        this.target = null;
        this.reason = null;
    }

    setData(message) {
        const args = message.content.split(" ").slice(1);

        this.executor = message.member;
        this.target = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]));
        this.reason = args.join(" ").replace(new RegExp(`( |)(${this.target.toString()}|${this.target.id})( |)`), "");
        
        return new Promise(r => r());
    }

    /** 
     * Matches a string with a regular expression and returns all capture groups
     * @param {String} str The string to match
     * @param {RegExp} regex The expression used to match
     * @returns {Promise<Array<matches>>} An array of all matches
    */
   matchAll(str, regex) {
        const res = [];
        let m;

        if (regex.global) {
            while (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        } else if (m = regex.exec(str)) { //eslint-disable-line no-cond-assign
                res.push(m.map(i => i));
            }
        return res[0] ? res[0].slice(1) : null;
    }

    check() {
        const check1 = this.executor.roles.highest.comparePositionTo(this.target.roles.highest) > 0;
        if (!check1) super.error("You can't execute this operation on this user.");
        const check2 = this.executor.guild.me.roles.highest.comparePositionTo(this.target.roles.highest) > 0;
        if (check1 && !check2) super.error("I can't execute this operation on that user.");

        return check1 && check2;
    }

    notify() {
        return new Promise(resolve => {
            this.target.send(`You have 1 new ${this.actionName}${this.reason ? ` for the reason \`${this.reason}\`` : ""}.`).then(resolve).catch(resolve);
        });
    }

    async send() {
        const channel = this.client.channels.find("name", this.client.config.logs.modlog);
        if (!channel) return super.error(`No moderation log found. Create a channel named \`${this.client.config.logs.modlog}\` to use moderation commands.`);
        if (!this.target) return super.error("No target found.");
        if (!this.executor) throw new Error(`No executor specified for the moderation command ${this.actionName}. Set the executor with super.setExecutor(message.author);`);

        const previous = (await channel.messages.fetch({ limit: 1 })).filter(c => c.author.id === this.client.user.id);
        const caseNumber = (previous.size ? parseInt(previous.first().embeds[0].footer.text.split(" ")[1]) + 1 : 1) || 1;

        const embed = new MessageEmbed()
            .setColor(this.color)
            .setAuthor(`${this.executor.displayName} (${this.executor.user.tag})`, this.executor.user.displayAvatarURL({ size: 128, format: "png" }))
            .setDescription(`**User:** ${this.target.displayName} (${this.target.user.tag})\n**Action:** ${this.actionName}\n**Reason:** ${this.reason || `Awaiting moderator's input. Type \`!reason ${caseNumber} <reason>\` to set reason.`}`)
            .setFooter(`Case ${caseNumber}`)
            .setTimestamp();

        channel.send({ embed });
        super.respond(`Operation executed on ${this.target.user.tag}.`);
    }
}

module.exports = ModerationCommand;
