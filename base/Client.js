const levels = require("../levels.json");
const { Collection, Client } = require("discord.js");
const { readdir } = require("fs");
const mysql = require("mysql");

/**
 * Represents a Discord client.
 * @extends {Discord.Client}
 */
class CustomClient extends Client {
    /**
     * @param {ClientOptions} clientOptions The options passed through the client. 
     */
    constructor(clientOptions) {
        super(clientOptions);

        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();

        this.attempts = new Collection();
        this.commandCooldowns = new Set();
        this.cooldowns = new Collection();
        this.tokens = new Collection();
        this.data = new Collection();
        this.currentData = new Collection(); 

        this.config = {};

        setInterval(() => {
            this.loop();
        }, 900000);

        //Data collection
        /*const now = new Date();
        const delay = 60 * 60 * 1000;
        const start = delay - (now.getMinutes() * 60 + now.getSeconds() * 1000 + now.getMilliseconds()); //eslint-disable-line no-mixed-operators

        setTimeout(() => {
            if (this.currentData.getHours() === 0) this.data.deleteAll();
                const time = new Date();
                time.setHours(time.getHours() - 1);

                const newData = { messages: this.currentData.get("messages") || 0, time };
                this.data.set(time, newData);
                this.currentData.delete("messages");
            call();
            setInterval(call, delay);
        }, start);*/
    }

    /**
     * Sets the config path used for the bot.
     * @param {String} path 
     */
    setConfig(path) {
        this.config = require(`../${path}`); //eslint-disable-line global-require
        
        return this;
    }

    /**
     * Creates a mysql connection.
     * @param {String} user The user used.
     * @param {String} pass The password used.
     * @param {String} db The database used.
     */
    sql(user, pass, db) {
        this.connection = mysql.createConnection({
            host: "localhost",
            user,
            password: pass,
            database: db,
            port: 3306
        });

        this.connection.connect((err) => {
            if (err) throw err;
            console.log(`Connected to sql database.`);
        });
    }

    /**
     * Loads all commands in the specified directory.
     * @param {String} path The filepath in which the commands are located.
     */
    loadCommands(path) {
    readdir(`${path}/`, (error, categories) => {
        categories.forEach(category => {
            readdir(`${path}/${category}/`, (err, commands) => {
                if (err) return;

                commands.forEach(command => {
                    const props = new (require(`../${path}/${category}/${command}`))(this); //eslint-disable-line global-require

                    props.conf.filepath = `${path}/${category}/${command}`;

                    this.commands.set(props.help.name, props);

                    if (props.init) props.init();

                    props.conf.aliases.forEach(alias => this.aliases.set(alias, props.help.name));
                });
            });
        });
    });

    return this;
    }

    /**
     * Loads all events in the specified directory.
     * @param {String} path The filepath in which the events are located.
     */
    loadEvents(path) {
        readdir(path, (error, events) => {
            events.forEach(event => {
                const props = new (require(`../${path}/${event}`))(this); //eslint-disable-line global-require

                super.on(event.split(".")[0], (...args) => props.run(...args));

                if (props.init) props.init();
            });
        });

        return this;
    }

    /**
     * Logs the client into Discord.
     * @param {String} token The bot's token. 
     */
    start(token) {
        super.login(token);

        return this;
    }

    /**
     * The code ran every 15 minutes.
     */
    loop() {
        this.connection.query("SELECT discord_id, player_name FROM linked_accounts", (err, fields) => {
            if (err) throw err;

            fields.forEach(player => {
                this.guilds.get(this.config.guild).members.fetch(player.discord_id).then(member => {
                    if (member.displayName !== player.player_name) member.setNickname(player.player_name).then(() => member.send("Your nickname has been synced with your minecraft username.").catch(() => null)).catch(() => null);
                }).catch(() => this.connection.query(`DELETE FROM linked_accounts WHERE discord_id = '${player.discord_id}';`));
            });
        });
    }

    /**
     * Creates a mysql query.
     * @param {String} sql The sql code to execute.
     */
    query(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    }

    /**
     * Fetches a user's permission level.
     * @param {String} user The ID of the target user. 
     */
    permLevel(user) {
        const perms = levels.perms.slice(1).sort((a, b) => b.level < a.level ? 1 : -1);

        let userPerms = perms[0];

        const guild = this.guilds.get(this.config.guild);
        if (!guild) return new Promise((resolve) => resolve(userPerms));

        return new Promise((resolve) => {
            guild.members.fetch(user).then(member => {
                while (perms.length) {
                    const current = perms.shift();
                    if (current.role && member.roles.exists("name", current.role)) userPerms = current;
                    if (current.ids && current.ids.includes(member.id)) userPerms = current;
                }

                resolve(userPerms);
            }).catch(() => {
                resolve(userPerms);
            });
        });
    }
}

module.exports = CustomClient;
