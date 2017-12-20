const ms = require("ms");

exports.run = (client, message, args) => {
    if (message.member.roles.find("name", "Verified")) {
        client.connection.query(`SELECT * FROM ${client.config.db.table} WHERE discord_id = "${message.member.id}"`, (err, result) => {
            if (result.length == 0) return message.author.send("Error fetching your name from database.");
            
            message.member.setNickname(result[0].player_name).catch(e => e);
            message.author.send(`We've detected that your account is already verified. We have updated your name to ${result[0].player_name}.`);
        });
    };

    const cooldown = client.cooldownData.get(message.author.id);
    if (cooldown && cooldown.for > 0) return message.error(`You are currently on cooldown for **${ms(cooldown.for - (Date.now() - cooldown.start), {long: true})}**.`);

    message.author.send(`Please send me your secret key. If you do not have a key yet, please go onto the \`mcdiamondfire.com\` server and type \`/verify\`.`).then(noticeMessage => {
        noticeMessage.channel.awaitMessages(m => !m.author.bot, {max: 1, time: 60000, limit: 1}).then(keyMessage => {
            keyMessage = keyMessage.first();
            if (keyMessage.content.includes("\"") || keyMessage.content.includes("\\")) return message.error("SQL injection attempt detected.");

            //Make an SQL query searching for the key.
            client.connection.query(`SELECT * FROM ${client.config.db.table} WHERE secret_key = "${keyMessage.content}"`, (error, result) => {
                if (result.length == 0) { //If the attempt is invalid...
                    //Cooldown system
                    if (!client.cooldownData.has(message.author.id)) client.cooldownData.set(message.author.id, {attempts: 0, for: 0, start: null});

                    const cooldownData = client.cooldownData.get(message.author.id);
                    cooldownData.attempts++;

                    if (cooldownData.attempts > 10) {
                        client.cooldownData.delete(message.author.id);
                        return message.author.sendMessage("You have attempted verification 11 times, so we suspect you of attempting to guess a key. For this reason, you are now permanently removed from this discord server. Sorry!").then(() => message.member.ban("Attempting verification over 10 times."));
                    }

                    if (cooldownData.attempts < 10) cooldownData.for = 600000;
                    if (cooldownData.attempts < 3) cooldownData.for = 60000;

                    cooldownData.start = Date.now();

                    client.cooldownData.set(message.author.id, cooldownData);

                    return keyMessage.error(`The key you entered (\`${keyMessage.content}\`) seems to be invalid. Please note that keys are **case sensitive.** You will now be on command cooldown for **${ms(cooldownData.for, {long: true})}**.`);
                }

                message.member.setNickname(result[0].player_name).catch(e => e);
                message.member.addRole(message.guild.roles.find("name", "Verified").id);

                client.cooldownData.delete(message.author.id);

                client.connection.query(`UPDATE ${client.config.db.table} SET discord_id = "${message.author.id}"`);

                keyMessage.success(`Welcome to discord, **${result[0].player_name}**!`);
            });
        });
    });
}

exports.help = {
    name: "verify",
    description: "Verify yourself on DiamondFire!",
    usage: "verify"
}

exports.conf = {
    enabled: true,
    permLvl: 0
}