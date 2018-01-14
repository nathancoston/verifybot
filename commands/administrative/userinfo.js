const { MessageEmbed } = require("discord.js");
const Base = require("../../base/Command.js");

module.exports = class Userinfo extends Base {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "Finds information on a user.",
      usage: "<user>",
      category: "administrative",
      permLevel: 5
    });
  }
  
  async run(message, args) {
    // Fetch the target user
    const user = await super.verifyUser(args[0]);
    const member = await message.guild.members.fetch(user.id);
    // Confirm that a user has been found
    if (!user) return super.error("Unknown user.");
    
    // Create a new embed
    const embed = new MessageEmbed()
      .setColor("#FFFFFF")
      .setAuthor(user.tag)
      .setFooter("VerifyBot User Information");
     
    // Add fields
   embed.addField("» Name", user.username, true);
   if (member.displayName !== user.username) embed.addField("» Nickname", member.displayName);
   embed.addField("» Roles", member.roles.map(r => r.name).join(", "), true);
   embed.addField("» Joined Discord", this.humanize(user.createdAt));
   embed.addField("» Joined Server", this.humanize(member.joinedAt));
    
   message.channel.send({ embed });
  }
  
  // Used to make dates easy to read
  humanize(date) {
    // Define months
    const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
};

