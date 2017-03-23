import * as builder from 'botbuilder';
import { createServer } from 'restify';
import fs = require('fs');

interface Recipe {
    name: string,
    description: string,
    cookTime: Date,
    cookingMethod: string;
    nutrition: NutritionInformation,
    prepTime: Date,
    recipeCategory: string,
    recipeCuisine: string,
    recipeIngredient: string[],
    recipeInstructions: string[],
    recipeYield: string,
    suitableForDiet: string,
    totalTime: Date
}

interface NutritionInformation {
    calories: number,
    carbohydrateContent: number,
    cholesterolContent: number,
    fatContent: number,
    fiberContent: number,
    proteinContent: number,
    saturatedFatContent: number,
    servingSize: string,
    sodiumContent: number,
    sugarContent: number,
    transFatContent: number,
    unsaturatedFatContent: number
}

const file = fs.readFileSync("recipes.json", "utf8")
const recipes: Partial<Recipe>[] = JSON.parse(file);

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
const startRecipe = /Let's start|Start|Let's Go|Go|I'm ready|Ready|OK|Okay/i;
const nextInstruction = /Next|What's next|OK/i;

bot.dialog('/', [
    (session) => {
        let groups: RegExpExecArray;
        // choose a recipe
        if (groups = chooseRecipe.exec(session.message.text)) {
            const name = groups[1];
            const recipe = recipeFromName(name);
            if (recipe) {
                session.privateConversationData.recipe = recipe;
                session.privateConversationData.lastInstructionSent = undefined;
                session.send(`Great, let's make ${name} which ${recipe.recipeYield}!`);
                recipe.recipeIngredient.forEach(ingredient => {
                    session.send(ingredient);
                })
                session.send("Let me know when you're ready to go.");
            } else {
                session.send(`Sorry, I don't know how to make ${name}. Maybe you can teach me.`);
            }
        // start reading the instructions
        } else if (session.privateConversationData.lastInstructionSent === undefined && startRecipe.test(session.message.text)) {
            if (!session.privateConversationData.recipe) {
                session.send("I'm glad you're so hot to trot, but please choose a recipe first.");
            } else {
                const recipe: Recipe = session.privateConversationData.recipe;
                session.privateConversationData.lastInstructionSent = 0;
                session.send(recipe.recipeInstructions[0]);
                if (recipe.recipeInstructions.length === 1)
                    session.send("That's it!");
            }
        // read the next instruction
        } else if (nextInstruction.test(session.message.text)) {
            const recipe: Recipe = session.privateConversationData.recipe;
            const nextInstruction: number = session.privateConversationData.lastInstructionSent + 1;

            if (nextInstruction < session.privateConversationData.recipe.recipeInstructions.length) {
                session.send(recipe.recipeInstructions[nextInstruction]);
                session.privateConversationData.lastInstructionSent = nextInstruction;
                if (recipe.recipeInstructions.length === nextInstruction + 1)
                    session.send("That's it!");
            } else {
                session.send("That's it!");
            }
        // default
        } else {
            session.send("I can't understand you. It's you, not me. Get it together and try again.");
        }
    }
]);

const recipeFromName = (name: string) =>
    recipes.find(recipe => recipe.name.toLowerCase() === name.toLowerCase());
