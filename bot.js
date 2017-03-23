"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const restify_1 = require("restify");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const server = restify_1.createServer();
server.listen(process.env.port || process.env.PORT || 3978, '::', () => console.log('%s listening to %s', server.name, server.url));
server.post('/api/messages', connector.listen());
const bot = new builder.UniversalBot(connector);
bot.on('conversationUpdate', (data) => {
    console.log(data);
});
bot.dialog('/', [(session) => {
        session.send("yo");
    }]);
