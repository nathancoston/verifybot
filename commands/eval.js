exports.run = (client, message, args) => {
    const start = Date.now();
    const result = new Promise((r) => r(eval(message.content.split(" ").slice(1).join(" "))));

    result.then(output => {
      output = require("util").inspect(output).replace(new RegExp(client.token, "ig"), "[REDACTED]");

      message.success(`Evaluated (${Date.now() - start}ms)\`\`\`js\n${output}\`\`\``);
    }).catch(error => {
      error = require("util").inspect(error).replace(new RegExp(client.token, "ig"), "[REDACTED]");

      message.error(`Errored (${Date.now() - start}ms)\`\`\`js\n${error}\`\`\``);
    });
}

exports.help = {
    name: "eval",
    description: "Evaluate JavaScript code.",
    usage: "eval <code>"
}

exports.conf = {
    enabled: true,
    permLvl: 5
}