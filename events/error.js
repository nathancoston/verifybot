module.exports = class {
    constructor(client) {
        this.client = client;
    }

    run(error) {
        console.log(`Websocket error:\n${error}`);
    }
}