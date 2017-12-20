exports.run = (client, message, args) => {
    message.success(`You are permission level \`${message.author.permLvl}\` (\`${client.config.permLevels[message.author.permLvl].name}\`)`);
}

exports.help = {
    name: "mylevel",
    description: "Get your permission level.",
    usage: "mylevel"
}

exports.conf = {
    enabled: true,
    permLvl: 0
}