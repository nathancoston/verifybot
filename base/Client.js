    const levels = require("../levels.json");
    const { Collection, Client, WebhookClient } = require("discord.js");
    const { readdir } = require("fs");
    const mysql = require("mysql");

    module.exports = class CustomClient extends Client {
        constructor(clientOptions) {
            super(clientOptions);

            this.commands = new Collection();
            this.aliases = new Collection();
            this.events = new Collection();

            this.attempts = new Collection();
            this.commandCooldowns = new Set();
            this.cooldowns = new Collection();
            this.tokens = new Collection();

            this.config = {};

            setInterval(() => {
                this.loop();
            }, 900000);
        }

        setConfig(path) {
            this.config = require(`../${path}`); //eslint-disable-line global-require
            
            return this;
        }

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

        start(token) {
            super.login(token);
            super.emit("login_start");

            return this;
        }

        log(content, wh) {
            if (wh && wh.id && wh.token) {
                const webhook = new WebhookClient(wh.id, wh.token);
                if (!webhook) return new Promise((res, rej) => rej("Unknown webhook."));
                
                return webhook.send(content);
            }

            return new Promise((res, rej) => rej("No webhook specified"));
        }

        loop() {
            this.connection.query("SELECT discord_id, player_name FROM linked_accounts", (err, fields) => {
                if (err) throw err;

                fields.forEach(player => {
                    this.guilds.get(this.config.guild).members.fetch(player.discord_id).then(member => {
                        if (member.displayName !== player.player_name) member.setNickname(player.player_name).then(() => member.send("Your nickname has been synced with your minecraft username.").catch(() => null)).catch(() => null);
                    }).catch(() => this.connection.query(`DELETE FROM linked_accounts WHERE discord_id = '${player.discord_id}';`));
                });
            });

            this.connection.query("SELECT @playercount;", (err, fields) => {
                if (err || !fields[0]) return this.user.setPresence({ status: "dnd", game: { name: "MySQL error" } });
                
                this.user.setActivity(`with ${fields[0].playercount} players`);
            });
        }
        
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
    };
