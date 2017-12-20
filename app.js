//Node modules
const {Client, Collection, Message} = require("discord.js");
const sql = require("mysql");
const fs = require("fs");

const config = require("./config.json");

//General variables
const client = new Client({fetchAllMembers: true});

//Client variables
client.commands = new Collection();
client.cooldownData = new Collection();

client.config = config;



//Login
client.login(config.token);

//SQL
const connection = sql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
 });

 connection.connect((err) => {
     if (err) return console.error(err);

     client.connection = connection;

     console.log(`Connected to mySQL database on port ${connection.config.port}.`);
 });

//Prototypes
Message.prototype.error = function(content, options) {
    content = "❌ Error | " + content;
    return this.channel.send(content, options).then(m => {
        if (m.channel.type === "text") m.delete(10000);
    });
}

Message.prototype.success = function(content, options) {
    content = "✅ Success | " + content;
    return this.channel.send(content, options).then(m => {
        if (m.channel.type === "text") m.delete(10000);
    });
}

Message.prototype.reply = function(content, options) {
    return this.channel.send(content, options).then(m => {
        if (m.channel.type === "text") m.delete(10000);
    });
}

//Command loader
fs.readdir("./commands/", (err, files) => {
    files.forEach(command => {
        const filepath = `./commands/${command}`;
        command = require(filepath);

        client.commands.set(command.help.name, command);
    });
});

//Events
client.on("ready", () => {
    console.log(`Successfully connected to discord as ${client.user.tag}.`);

    client.guilds.first().members.map(m => {
        if (!m.nickname && m.roles.find("name", "Verified") && !m.user.bot) {
            connection.query(`SELECT * FROM ${config.db.table} WHERE discord_id = "${m.id}"`, (err, result) => {
                if (result.length > 0) m.setNickname(result[0].player_name).catch(e => e);
            });
        }
    });
});

client.on("guildMemberUpdate", (old, member) => {
    if (old.user.username === member.user.username || member.user.bot || !member.roles.find("name", "Verified")) return;

    client.connection.query(`SELECT * FROM ${config.db.table} WHERE discord_id = "${member.id}"`, (err, result) => {
        if (result.length > 0) member.setNickname(result[0].player_name);
    });
});

client.on("message", message => {
    const args = message.content.split(/\s+/g);
    const command = args.shift().slice(config.prefix.length);

    const cmd = client.commands.get(command);

    if (!cmd || !message.content.startsWith(config.prefix) || !cmd.conf.enabled || message.channel.type !== "text") return;
    //Permissions - edit in config.json

    let permLvl = 0;
    
    Object.entries(config.permLevels).forEach(p => {
        if (p[1].role && message.member.roles.find("name", p[1].role)) permLvl = p[0];
        if (p[1].condition && p[1].condition === "bot_owner") permLvl = p[0];
    });

    if (permLvl < cmd.conf.permLvl) return message.error(`Your permission level is too low to execute this command. You are permission level ${permLvl} (\`${config.permLevels[permLvl].name}\`) and this command requires permission level \`${cmd.conf.permLvl}\` (\`${config.permLevels[cmd.conf.permLvl].name}\`).`);

    message.author.permLvl = permLvl;

    cmd.run(client, message, args); 
    message.delete();
});