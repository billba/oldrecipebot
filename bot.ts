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

bot.dialog('/', [
    (session) => {
        let groups: RegExpExecArray;
        if (groups = chooseRecipe.exec(session.message.text)) {
            const name = groups[1];
            const recipe = recipeFromName(name);
            if (recipe) {
                session.send(`Great, let's make ${name} which ${recipe.recipeYield}!`);
            } else {
                session.send(`Sorry, I don't know how to make ${name}. Maybe you can teach me.`);
            }
            return;
        }
        session.send("I can't understand you. It's you, not me. Get it together and try again.");
    }
]);

const recipeFromName = (name: string) =>
    recipes.find(recipe => recipe.name.toLowerCase() === name.toLowerCase());
