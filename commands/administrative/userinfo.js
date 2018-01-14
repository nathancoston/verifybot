const { MessageEmbed } = require("discord.js");
const Base = require("../../base/Command.js");

module.exports = class Userinfo extends Base {
  constructor(client) {
      super(client, {
          name: "userinfo",
          description: "Finds information on a user.",
          usage: "<user>",
          category: "administrative",
          permLevel: 4
      });
  }

  async run(message, args) {
      // Fetch the target user
      const user = await super.verifyUser(args[0]);
      // Fetch the guild member
      const member = await message.guild.members.fetch(user.id);
      // Fetch the user's permission level
      const permLevel = await this.client.permLevel(user.id);
      // Confirm that a user has been found
      if (!user) return super.error("Unknown user.");

      // Create a new embed
      const embed = new MessageEmbed()
          .setColor("#FFFFFF")
          .setAuthor(user.tag, user.avatarURL())
          .setFooter("VerifyBot User Information", this.client.user.avatarURL());

      // Add fields
      embed.addField("» Name", user.username, true);
      if (member.displayName !== user.username) embed.addField("» Nickname", member.displayName, true);
      embed.addField("» Roles", member.roles.filter(r => r.id !== member.guild.id).map(r => r.name).join(", "), true);
      embed.addField("» Permission Level", `**${permLevel.level}** (\`${permLevel.name}\`)`, true);
      embed.addField("» Joined Discord", this.humanize(user.createdAt), true);
      embed.addField("» Joined Server", this.humanize(member.joinedAt), true);

      // Send the embed
      message.channel.send({
          embed
      });
  }

  // Used to make dates easy to read
  humanize(date) {
      // Define months
      const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
};
