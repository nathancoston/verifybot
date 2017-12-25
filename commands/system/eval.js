const Base = require("../../base/Command.js");
const {inspect} = require("util");

module.exports = class Eval extends Base {
    constructor(client) {
        super(client, {
            name: "eval",
            description: "Evaluate arbitrary JavaScript code.",
            usage: "<code>",
            category: "system",
            permLevel: 10
        });
    }

    run(message) {
        const start = Date.now();
        const result = new Promise((r) => r(eval(message.content.split(" ").slice(1).join(" "))));
    
        result.then(output => {
          const out = inspect(output);
    
          super.respond(`Evaluated successfully (${Date.now() - start}ms)\`\`\`js\n${out}\`\`\``).catch(() => super.error("Output too long to send."));
        }).catch(err => {
          const error = inspect(err);
    
          super.error(`Errored (${Date.now() - start}ms)\`\`\`js\n${error}\`\`\``).catch(() => super.error("Output too long to send"));
        });
    }
};
