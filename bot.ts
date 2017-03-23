import * as builder from 'botbuilder';
import { createServer } from 'restify';
import { config } from 'dotenv';

config();

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const server = createServer();
server.listen(process.env.port || process.env.PORT || 3978, '::', () =>
    console.log('%s listening to %s', server.name, server.url)
);
server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector);

bot.on('conversationUpdate', (data) => {
    console.log(data);
});

const chooseRecipe = /I want to make (.*)\./i;

bot.dialog('/', [
    (session) => {
        let groups: RegExpExecArray;
        if (groups = chooseRecipe.exec(session.message.text)) {
            session.send(`Great, let's make ${groups[1]}!`);
        } else {
            session.send("I can't understand you. It's you, not me. Get it together and try again.");
        }
    }
]);