"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const restify_1 = require("restify");
const fs = require("fs");
const lcs = require("longest-common-substring");
const weightsAndMeasures_1 = require("./weightsAndMeasures");
//convertIngredient("1oz cheese", "metric");
//convertIngredient("1lb cheese", "metric");
//convertIngredient("10g cheese", "imperial");
weightsAndMeasures_1.convertIngredient("10floz milk", "metric");
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
bot.on('conversationUpdate', activity => {
    bot.send(new builder.Message().address(activity.address).text("Let's get cooking!"));
});
const intents = {
    instructions: {
        start: /(Let's start|Start|Let's Go|Go|I'm ready|Ready|OK|Okay)\.*/i,
        next: /(Next|What's next|next up|OK|okay|Go|Continue)/i,
        previous: /(go back|back up)/i,
        repeat: /(what's that again|huh|say that again|repeat that|please repeat that)/i,
        restart: /(start over|start again|)/i
    },
    chooseRecipe: /I want to make (?:|a|some)*\s*(.+)/i,
    queryQuantity: /how (?:many|much) (.+)/i,
};
bot.dialog('/', [
    (session) => {
        const state = session.privateConversationData;
        let groups;
        // choose a recipe
        if (groups = intents.chooseRecipe.exec(session.message.text)) {
            const name = groups[1];
            const recipe = recipeFromName(name);
            if (recipe) {
                state.recipe = recipe;
                delete state.lastInstructionSent; // clear this out in case we're starting over
                session.send(`Great, let's make ${name} which ${recipe.recipeYield}!`);
                recipe.recipeIngredient.forEach(ingredient => {
                    session.send(ingredient);
                });
                session.send("Let me know when you're ready to go.");
            }
            else {
                session.send(`Sorry, I don't know how to make ${name}. Maybe you can teach me.`);
            }
            // Answer a query about ingredient quantity
        }
        else if (groups = intents.queryQuantity.exec(session.message.text)) {
            if (!state.recipe) {
                session.send("I can't answer that without knowing what we're making.");
            }
            else {
                const ingredientQuery = groups[1].split('');
                const ingredient = state.recipe.recipeIngredient
                    .map(i => [i, lcs(i.split(''), ingredientQuery).length])
                    .reduce((prev, curr) => prev[1] > curr[1] ? prev : curr)[0];
                session.send(ingredient);
            }
            // read the next instruction
        }
        else if (state.lastInstructionSent !== undefined && intents.instructions.next.test(session.message.text)) {
            const nextInstruction = state.lastInstructionSent + 1;
            if (nextInstruction < state.recipe.recipeInstructions.length) {
                session.send(state.recipe.recipeInstructions[nextInstruction]);
                state.lastInstructionSent = nextInstruction;
                if (state.recipe.recipeInstructions.length === nextInstruction + 1)
                    session.send("That's it!");
            }
            else {
                session.send("That's it!");
            }
            // repeat the current instruction
        }
        else if (state.lastInstructionSent !== undefined && intents.instructions.repeat.test(session.message.text)) {
            session.send(state.recipe.recipeInstructions[state.lastInstructionSent]);
            // read the previous instruction
        }
        else if (state.lastInstructionSent !== undefined && intents.instructions.previous.test(session.message.text)) {
            const prevInstruction = state.lastInstructionSent - 1;
            if (prevInstruction >= 0) {
                session.send(state.recipe.recipeInstructions[prevInstruction]);
                state.lastInstructionSent = prevInstruction;
            }
            else {
                session.send("We're at the beginning.");
            }
            // start over
        }
        else if (state.lastInstructionSent !== undefined && intents.instructions.restart.test(session.message.text)) {
            state.lastInstructionSent = 0;
            session.send(state.recipe.recipeInstructions[0]);
            if (state.recipe.recipeInstructions.length === 1)
                session.send("That's it!");
            // start reading the instructions
        }
        else if (intents.instructions.start.test(session.message.text)) {
            if (!state.recipe) {
                session.send("I'm glad you're so hot to trot, but please choose a recipe first.");
            }
            else if (state.lastInstructionSent !== undefined) {
                if (state.lastInstructionSent + 1 === state.recipe.recipeInstructions.length) {
                    session.send("We're all done with that recipe. You can choose another recipe if you like.");
                }
                else {
                    session.send("We're still working on this recipe. You can continue, or choose another recipe.");
                }
            }
            else {
                state.lastInstructionSent = 0;
                session.send(state.recipe.recipeInstructions[0]);
                if (state.recipe.recipeInstructions.length === 1)
                    session.send("That's it!");
            }
        }
        else {
            session.send("I can't understand you. It's you, not me. Get it together and try again.");
        }
    }
]);
const recipeFromName = (name) => recipes.find(recipe => recipe.name.toLowerCase() === name.toLowerCase());
//# sourceMappingURL=bot.js.map