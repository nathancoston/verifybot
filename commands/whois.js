exports.run = (client, message, args) => {
    let user = /(\d{16,21}|.{1,32}#\d{4})/g.exec(args.join(" "));
    if (!user) return message.error("Unable to find user.");

    user = message.guild.member(user[0]) || message.guild.members.find(m => m.user.tag === user[0]);
    if (!user) return message.error("Unable to find user.");

    user = user.user;

    client.connection.query(`SELECT * FROM ${client.config.db.table} WHERE discord_id = "${user.id}"`, (err, result) => {
        if (result.length == 0) return message.error("No information was found on this user.");

        message.author.send(`= Information on User: ${user.tag} =\n\nUsername :: ${result[0].player_name}\nUUID     :: ${result[0].player_uuid}`, {code: "asciidoc"});
    });
}

exports.help = {
    name: "whois",
    description: "Get information on a user.",
    usage: "whois <user>"
}

exports.conf = {
    enabled: true,
    permLvl: 3
}