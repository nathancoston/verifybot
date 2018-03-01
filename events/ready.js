const { readFileSync } = require("fs");
const ms = require("pretty-ms");

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        // Check node version
        if (parseInt(process.version.split(".")[0]) < 8) throw new Error("Your node version is too low, meaning VerifyBot will not function. Please update node if possible.");
        // Inform user that connection to websocket has been made
        console.log(`Connected to Discord as ${this.client.user.tag}.`);

        // Activate dashboard
        require("../dashboard/dashboard")(this.client);

        try {
            // Fetch reboot info
            const reboot = JSON.parse(readFileSync("restart.json"));
            // Fetch reboot message
            const message = await this.client.channels.get(reboot.channel).messages.fetch(reboot.id);
            // Update reboot timestamp
            message.edit(`✅ | Successfully rebooted in ${Date.now() - reboot.time}ms.`);
        } catch (e) {
            return null;
        }

        const fetchData = require("../methods/restricted/fetchNodeData");

        let nodesOnline = [];

        // Start node data loop
        setInterval(async () => {
            // Fetch node data
            const { online, offline, list } = await fetchData(this.client);
            
            // Fetch the updates channel
            const channel = this.client.guild.channels.find("name", this.client.config.channels.nodes);
            // If no channel found, return
            if (!channel) return;

            const node1 = list.find(data => data.node === 1);
            const node2 = list.find(data => data.node === 2);
            const node3 = list.find(data => data.node === 3);

            if (nodesOnline.length > online.length) {
                const nodes = online.map(({ node }) => node);
                const node = nodesOnline.find(n => !nodes.includes(n));
                const message = `${node ? `Node ${node}` : "**All nodes**"} crashed! Check ${channel.toString()} for more information.`;

                this.client.guild.members.filter(member => member.roles.exists("name", "Developer")).forEach(member => {
                    member.send(message).catch(() => null);
                });
            }

            nodesOnline = online.map(({ node }) => node);

            const embed = channel.buildEmbed()
                .setColor(online.length < 3 ? "RED" : "GREEN")
                .setAuthor("Node Report")
                .setDescription(`${offline.length === 0 ? "No" : offline.length} node${offline.length === 1 ? "" : "s"} offline.`)
                .addField("Node 1", `${node1.online ? `Online with ${node1.players} players` : `Offline for ${ms(Date.now() - node1.updated, { verbose: true, secDecimalDigits: 0 })}`}`)
                .addField("Node 2", `${node2.online ? `Online with ${node2.players} players` : `Offline for ${ms(Date.now() - node2.updated, { verbose: true, secDecimalDigits: 0 })}`}`)
                .addField("Node 3", `${node3.online ? `Online with ${node3.players} players` : `Offline for ${ms(Date.now() - node3.updated, { verbose: true, secDecimalDigits: 0 })}`}`);

            const collection = await channel.messages.fetch({ limit: 1 });
            
            if (collection.size === 0) return embed.send();
            
            const message = collection.first();

            message.edit({ embed });
        }, 30000);
    }
};
