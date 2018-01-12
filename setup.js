// Run "npm run init" in console to set up VerifyBot

const program = require("commander");
const { prompt } = require("inquirer");
const { writeFile } = require("fs");
const { inspect } = require("util");

const questions = [
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
    }
];

program
    .version("1.0.0")
    .description("Creates a config file..");

program
    .command("init")
    .description("Sets a value in the config.")
    .action(() => {
        prompt(questions).then(answers => {
            console.log("Config values created. Creating config.json...");
            writeFile("config.json", JSON.stringify(answers, null, "\t"), (err) => {
                if (err) return console.log(`Error creating file:\n${err}`);
                console.log("Config initalized! Warning: some features may still not be fully functional as some files are removed to maintain security of the data structures.");
            });
        });
    });

program.parse(process.argv);
