"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const restify_1 = require("restify");
const fs = require("fs");
const file = fs.readFileSync("recipes.json", "utf8");
const recipes = JSON.parse(file);
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
const chooseRecipe = /I want to make (.*)\./i;
bot.dialog('/', [
    (session) => {
        let groups;
        if (groups = chooseRecipe.exec(session.message.text)) {
            const name = groups[1];
            const recipe = recipeFromName(name);
            if (recipe) {
                console.log(recipe);
                session.send(`Great, let's make ${name} which ${recipe.recipeYield}!`);
                recipe.recipeIngredient.forEach(ingredient => {
                    session.sendTyping();
                    session.send(ingredient);
                });
                session.send("Say start when you're ready to go.");
            }
            else {
                session.send(`Sorry, I don't know how to make ${name}. Maybe you can teach me.`);
            }
            return;
        }
        session.send("I can't understand you. It's you, not me. Get it together and try again.");
    }
]);
const recipeFromName = (name) => recipes.find(recipe => recipe.name.toLowerCase() === name.toLowerCase());
//# sourceMappingURL=bot.js.map