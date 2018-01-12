// Run "npm run init" in console to set up VerifyBot

// Module imports
const program = require("commander");
const { prompt } = require("inquirer");
const { writeFile } = require("fs");

// Create a new array with queries
const questions = [
    {
        type: "input",
        name: "guild",
        message: "Primary Guild: "
    },
    {
        type: "input",
        name: "prefix",
        message: "Bot Prefix: "
    },
    {
        type: "input",
        name: "credentials.token",
        message: "Bot Token: "
    },
    {
        type: "input",
        name: "dashboard.clientSecret",
        message: "Client Secret: "
    },
    {
        type: "input",
        name: "credentials.mysql.db",
        message: "Mysql Database: "
    },
    {
        type: "input",
        name: "credentials.mysql.user",
        message: "Mysql User: "
    },
    {
        type: "input",
        name: "credentials.mysql.pass",
        message: "Mysql Pass: "
    },
    {
        type: "input",
        name: "dashboard.domain",
        message: "Dashboard Domain: "
    },
    {
        type: "input",
        name: "dashboard.port",
        message: "Dashboard Port: "
    },
    {
        type: "input",
        name: "dashboard.secret",
        message: "Dashboard Secret: "
    },
    {
        type: "input",
        name: "logs.deleted",
        message: "Deleted Messages Log (Channel Name): "
    }
];

// Load program information
program
    .version("1.0.2")
    .description("Creates a config file..");

// Init command - initializes config
program
    .command("init")
    .description("Sets a value in the config.")
    .action(() => {
        // Prompt for all questions
        prompt(questions).then(answers => {
            // Log that config values have been stored
            console.log("Config values created. Creating config.json...");
            // Write to config.json with the new config values
            writeFile("config.json", JSON.stringify(answers, null, "\t"), (err) => {
                // If error thrown, log in console
                if (err) return console.log(`Error creating file:\n${err}`);
                // Inform the user that config has been initialized
                console.log("Config initalized! Warning: some features may still not be fully functional as some files are removed to maintain security of the data structures.");
            });
        });
    });

// Load commands
program.parse(process.argv);
