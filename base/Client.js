const { Collection, Client } = require("discord.js");
const { readdir } = require("fs");
const { get } = require("snekfetch");
const mysql = require("mysql");
const levels = require("../levels.json");

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
        this.cooldowns = new Collection();
        this.tokens = new Collection();
        this.mutes = new Collection();

        this.config = {};

        setInterval(this.loop, 900000);
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

        return this;
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
    async loop() {
        // Fetch all verified users
        const verified = this.guilds.get(this.config.guild).members.filter(m => m.roles.exists("name", "Verified"));
        // Fetch all linked accounts
        const linked = await this.query(`SELECT player_name,discord_id FROM linked_accounts;`);

        // Run through all of them
        verified.forEach(async member => {
            // Fetch their data
            const data = linked.find(user => user.discord_id === member.id);
            // If no data found...
            if (!data) {
                // Unverify them
                member.roles.remove(member.roles.find("name", "Verified")).catch(() => null);
                // Send them a message
                member.send(`You've been unverified as you are not registered in the database. This is most likely because you were verified by an admin, meaning VerifyBot has no idea who you are.`).catch(() => null);
                // Clear their nickname
                member.setNickname("").catch(() => null);
            }
        });

        // Fetch server stats
        const body = await get("https://api.mcsrvstat.us/1/mcdiamondfire.com");
        // If no body text found, return
        if (!body.text) return;
        // Fetch online players
        this.user.setActivity(`with ${JSON.parse(body.text).players.online} players`);
    }

    async fetchWeeklyData() {
        const fetch = require("../methods/restricted/fetchWeeklyData"); //eslint-disable-line global-require

        const data = await fetch(this);
        const announcements = this.guilds.get(this.config.guild).channels.find("name", "announcements");
        const message = [
            "Hello, @everyone! It's the end of the week, so we'll be going through the top 5 creators, plots, and support of the month!",
            `\`\`\`asciidoc\n== Top Creators\nBeta\`\`\``,
            `\`\`\`asciidoc\n== Top Plots\nBeta\`\`\``,
            `\`\`\`asciidoc\n== Top Support\n${data.topSupport.map((info, index) => `${index + 1} :: ${info.name} with ${info.sessions} sessions`).join("\n")}\`\`\``
        ];

        announcements.send(message.join("\n"));
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
        const perms = levels.perms.sort((a, b) => b.level < a.level ? 1 : -1);

        let userPerms = perms[0];

        const guild = this.guilds.get(this.config.guild);
        if (!guild) return new Promise((resolve) => resolve(userPerms));

        return new Promise((resolve) => {
            guild.members.fetch(user).then(member => {
                userPerms = perms.filter(p => (p.role && member.roles.exists("name", p.role)) || (p.ids && p.ids.includes(user))).pop();
                resolve(userPerms);
            }).catch((e) => {
                console.log(e);
                resolve(userPerms);
            });
        });
    }
}

module.exports = CustomClient;
