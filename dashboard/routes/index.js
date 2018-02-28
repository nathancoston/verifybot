const { Router } = require("express");

const passport = require("passport");
const ms = require("pretty-ms");
const uuid = require("uuid/v4");

const checkAuth = require("../functions/checkAuth");
const fetchVariables = require("../functions/fetchVariables");

// Initialise router
const router = Router();

// GET /login
router.get("/login", passport.authenticate("discord"));

// GET /callback
router.get("/callback", passport.authenticate("discord", { failureRedirect: "/error" }), (req, res) => {
    res.redirect("/");
});

// GET /error
router.get("/error", (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);

    res.render(`${templateDir}/autherror.ejs`, {
        client,
        path: req.path,
        auth: req.isAuthenticated(),
        user: req.isAuthenticated() ? req.user : null
    });
});

// GET /logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// GET /
router.get("/", checkAuth, async (req, res) => {
    // Fetch variables
    const { client, templateDir } = fetchVariables(req);
    // Create a data object to be passed to the client
    const data = { error: null, message: null };

    // Define data values
    if (req.query.error) data.error = req.query.error;
    if (req.query.message) data.message = req.query.message;

    // If verification token is present in queries...
    if (req.query.token) {
        // Load confirmation screen.
        res.render(`${templateDir}/confirm.ejs`, {
            client,
            data: client.tokens.get(req.user.id),
            user: req.user
        });

        // If user has entry in tokens collection...
        if (client.tokens.has(req.user.id)) {
            // Fetch account info from token
            const accInfo = client.tokens.get(req.user.id);
            // Fetch member from guild
            const member = client.guild.members.get(req.user.id);
            // Throw 404 if member is invalid
            if (!member) return res.status(404);

            // Attempt to set nickname
            member.setNickname(accInfo.data.player_name).catch(() => null);
            // Attempt to add Verified role
            member.roles.add(member.guild.roles.find("name", "Verified")).catch(() => null);
            // Remove user's token info from collection
            client.tokens.delete(req.user.id);

            // Update discord ID and remove secret key
            client.connection.query(`UPDATE linked_accounts SET discord_id = ${req.user.id}, secret_key = null WHERE player_name = '${accInfo.data.player_name.replace(/[^a-z_\d]/ig)}'`);

            // Find the verification logs channel
            const channel = member.guild.channels.find("name", client.config.channels.verification);
            // If no channel found, return
            if (!channel) return;
            // Create a new embed
            const embed = channel.buildEmbed(this.client.config.embedTemplate)
                .setColor([67, 181, 129])
                .setAuthor(`${accInfo.data.player_name} (${member.user.tag})`, member.user.avatarURL({ size: 64, format: "png" }))
                .setTitle("User Verified")
                .setDescription(`${member.user.tag} verified their account as ${accInfo.data.player_name}.`);

            // Send the embed
            embed.send();
        }

        return;
    }

    // Render verification screen
    res.render(`${templateDir}/index.ejs`, {
        client,
        data,
        path: req.path,
        auth: true,
        user: req.user,
        perms: await client.permLevel(req.user.id)
    });
});

// POST /
router.post("/", checkAuth, async (req, res) => {
    // Fetch variables
    const { client } = fetchVariables(req);
    // Fetch user perms
    const perms = await client.permLevel(req.user.id);
    // Fetch guild member
    const member = await client.guild.members.fetch(req.user.id);

    // If no member is present, throw an error
    if (!member) return res.redirect("?error=You are not on the DiamondFire discord server!");
    // If user is verified, throw error
    if (perms.level >= 1) return res.redirect(`?error=You are already verified!`);
    // If user does not fill out the input, throw error
    if (!req.body.key) return res.redirect("?error=Please provide a secret key.");

    // Fetch user attempts
    let attempts = client.attempts.get(req.user.id) || 0;
    // Fetch cooldown expiration
    let cooldown = client.cooldowns.get(req.user.id) || Date.now();

    // If user is on cooldown, throw an error
    if (cooldown > Date.now()) return res.redirect(`?error=You are on cooldown. Please try again in ${ms(cooldown - Date.now(), { verbose: true })}.`);

    // Fetch verification information from linked accounts, sanitizing secret key
    const fields = await client.query(`SELECT player_name, secret_key FROM linked_accounts WHERE secret_key = '${req.body.key.replace(/[^a-z\d]/ig, "")}'`);
    // If no data is returned, or player name specified does not match player name associated with input key...
    if (!fields[0]) {
        // Increment attempts
        attempts++;

        // If attempts is greater than 1, set cooldown to one minute
        if (attempts >= 1) cooldown += 60000;
        // If attempts is greater than 7, set cooldown to one hour
        if (attempts >= 7) cooldown += 600000;

        // If attempts is greater than 10...
        if (attempts >= 10) {
            // Delete their attempt data
            client.attempts.delete(req.user.id);
            // Delete their cooldown data
            client.cooldowns.delete(req.user.id);
            // Ban them from the Discord server
            member.ban({ reason: "10 attempts at verification." }).catch(() => null);
            // Throw an error
            return res.redirect("?error=Your key is invalid. Since you have over 10 attempts, you have been banned from the discord server.");
        }

        //Update attempts
        client.attempts.set(req.user.id, attempts);
        // Update cooldown
        client.cooldowns.set(req.user.id, cooldown);

        // Notify user that their key is invalid
        return res.redirect(`?error=Your key is invalid. Please wait for ${attempts >= 7 ? "10 minutes" : "1 minute"} before verifying yourself again.`);
    }

    // Delete attempt data (if present)
    client.attempts.delete(req.user.id);
    // Delete cooldown data (if present)
    client.cooldowns.delete(req.user.id);

    // Generate a verification token
    const token = uuid();
    // Insert into the tokens collection the user's id, account info, and token
    client.tokens.set(req.user.id, { data: fields[0], token });
    // Generate a timestamp (used for embed footer)
    const timestamp = new Date();

    // Notify the user to check their direct messages
    res.redirect("?message=Check your private messages on discord.");
    // Send the user an embed with a link to verification confirmation
    member.send({ embed: {
        color: 3060589,
        author: {
            name: "Confirm Verification"
        },
        description: `Click [here](${client.config.dashboard.domain}?token=${token}) to verify your account. This will expire in **3** minutes.`,
        timestamp
    } }).catch(() => res.redirect("?error=You do not have direct messages enabled."));

    // In 3 minutes, delete their token information as it has expired
    setTimeout(() => {
        client.tokens.delete(req.user.id);
    }, 180000);
});

// Export the router
module.exports = router;
