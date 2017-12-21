const path = require("path");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LevelStore = require("level-session-store")(session);
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { Strategy } = require("passport-discord");
const uuid = require("uuid/v4");

const app = express();

module.exports = (client) => {
    //Directories
    const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
    const templateDir = path.resolve(`${dataDir + path.sep}templates`);

    //Client side
    app.use("/public", express.static(path.resolve(`${dataDir}${path.sep}public`)));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //Passport-discord crap
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    console.log(client.config.dashboard.domain);

    //Define OAUTH2 data.
    passport.use(new Strategy({
        clientID: client.user.id,
        clientSecret: client.config.dashboard.clientSecret,
        callbackURL: `${client.config.dashboard.domain}/callback`,
        scope: ["identify"]
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    //Session data
    app.use(session({
        store: new LevelStore("./data/dashboard-session/"),
        secret: client.config.dashboard.secret,
        resave: false,
        saveUninitialized: false
    }));

    //Initialize passport & session
    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = client.config.dashboard.domain;

    //EJS engine
    app.engine("html", ejs.renderFile);
    app.set("view engine", "html");

    //AUTH checks
    function checkAuth(req, res, next) {
        if (req.isAuthenticated()) return next();

        res.redirect("/login");
    }
    
    //Login
    app.get("/login", (req, res, next) => {
        next();
    }, passport.authenticate("discord"));

    app.get("/callback", passport.authenticate("discord", { failureRedirect: "/error" }), (req, res) => {
        res.redirect("/verify");
    });

    app.get("/error", (req, res) => {
        res.render(`${templateDir}/autherror.ejs`, {
            client,
            path: req.path,
            auth: req.isAuthenticated(),
            user: req.isAuthenticated() ? req.user : null
        });
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/verify");
    });

    app.get("/verify", checkAuth, async (req, res) => {
        const data = { error: null, message: null };

        if (req.query.error) data.error = req.query.error;
        if (req.query.message) data.message = req.query.message;

        if (req.query.token) {
            res.render(`${templateDir}/confirm.ejs`, {
                client,
                data: client.tokens.get(req.user.id),
                user: req.user
            });

            if (client.tokens.has(req.user.id)) {
                const accInfo = client.tokens.get(req.user.id);

                const member = client.guilds.get(client.config.guild).members.get(req.user.id);

                if (!member) return res.status(404);

                member.setNickname(accInfo.data.player_name).catch(() => null);
                member.addRole(member.guild.roles.find("name", "Verified")).catch(console.log);

                client.tokens.delete(req.user.id);
                client.log(`**${req.user.username}#${req.user.tag}** has been verified as **${accInfo.data.player_name}**.`, client.config.webhooks.logs);

                client.connection.query(`UPDATE linked_accounts SET discord_id = ${req.user.id}, secret_key = null WHERE player_name = '${accInfo.data.player_name.replace(/[^a-z_\d]/ig)}'`);
            }

            return;
        }

        res.render(`${templateDir}/verify.ejs`, {
            client,
            data,
            path: req.path,
            auth: true,
            user: req.user,
            perms: await client.permLevel(req.user.id)
        });
    });
    
    app.get("/staff", checkAuth, async (req, res) => {
        const perms = await client.permLevel(req.user.id);

        if (perms < 2) return res.status(404);

        client.connection.query(`SELECT player_name, player_uuid FROM linked_accounts WHERE discord_id = '${req.user.id}';`, (err, fields) => {
            if (err) throw err;

            client.connection.query(`SELECT support, moderation FROM ranks WHERE uuid = '${fields[0].player_uuid}';`, async (error, data) => {
                res.render(`${templateDir}/staff.ejs`, {
                    client,
                    data: data[0],
                    auth: true,
                    user: req.user,
                    playername: fields[0].player_name
                });
            });
        });
    });

    app.post("/verify", checkAuth, async (req, res) => {
        const perms = await client.permLevel(req.user.id);
        const member = client.guilds.get(client.config.guild).members.get(req.user.id);
        
        if (!member) return res.redirect("/verify?error=You are not on the DiamondFire discord server!");
        //if (perms.level >= 1) return res.redirect(`/verify?error=You are already verified!`);
        if (!req.body.username || !req.body.key) return res.redirect("/verify?error=You need to fill out both your Minecraft username and key.");

        //Cooldown
        let attempts = client.attempts.get(req.user.id) || 0;
        let cooldown = client.cooldowns.get(req.user.id) || Date.now();

        if (cooldown > Date.now()) return res.redirect("/verify?error=You are on cooldown. Please try again later.");

        client.connection.query(`SELECT player_name, secret_key FROM linked_accounts WHERE secret_key = '${req.body.key.replace(/[^a-z\d]/ig, "")}'`, async (err, fields) => {
            if (err) throw err;

            if (!fields[0] || fields[0].player_name !== req.body.username) {
                attempts++;

                if (attempts >= 1) cooldown += 60000;
                if (attempts >= 7) cooldown += 600000;

                if (attempts >= 10) {
                    client.attempts.delete(req.user.id);
                    client.cooldowns.delete(req.user.id);

                    member.ban({ reason: "10 attempts at verification." }).catch(() => null);

                    return res.redirect("/verify?error=Your key is invalid. Since you have over 10 attempts, you have been banned from the discord server.");
                }

                client.attempts.set(req.user.id, attempts);
                client.cooldowns.set(req.user.id, cooldown);

                return res.redirect(`/verify?error=Your key is invalid. Please wait for ${attempts >= 7 ? "10 minutes" : "1 minute"} before verifying yourself again.`);
            }

            client.attempts.delete(req.user.id);
            client.cooldowns.delete(req.user.id);

            const token = uuid();
            client.tokens.set(req.user.id, { data: fields[0], token });

            const timestamp = new Date();

            res.redirect("/verify?message=Check your private messages on discord.");

            member.user.send({ embed: {
                color: 3060589,
                author: {
                    name: "Confirm Verification"
                },
                description: `Click [here](${client.config.dashboard.domain}/verify?token=${token}) to verify your account. This will expire in **3** minutes.`,
                timestamp
            } }).catch(() => res.redirect("/verify?error=You do not have direct messages enabled."));

            setTimeout(() => {
                client.tokens.delete(req.user.id);
            }, 180000);
        });
    });

    app.listen(4040);
};
