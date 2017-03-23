import * as builder from 'botbuilder';
import { createServer } from 'restify';
import { config } from 'dotenv';

import fs = require('fs');

config();

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

bot.dialog('/', [(session) => {
    session.send("yo");
}]);

const recipeFromName = (name) =>
    recipes.find(recipe => recipe.name === name);


// enum RestrictedDiet {
//     DiabeticDiet,
//     GlutenFreeDiet,
//     HalalDiet,
//     HinduDiet,
//     KosherDiet,
//     LowCalorieDiet,
//     LowFatDiet,
//     LowLactoseDiet,
//     LowSaltDiet,
//     VeganDiet,
//     VegetarianDiet,
// }
