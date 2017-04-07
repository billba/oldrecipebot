import { recipes } from './bot';
import { bot } from './bot';

import * as builder from 'botbuilder';
import { createJsonClient } from 'restify';
import scrapper = require('html-scrapper');
import mongoose = require('mongoose');

const Source = scrapper.Source;
const Extractor = scrapper.Extractor;
const Fn = scrapper.Fn;

interface SearchResponse{
    _type: string,
    webPages: SearchResponseWebPages,
    rankingResponse: string,
}

interface SearchResponseWebPages{
    webSearchUrl: string,
    totalEstimatedMatches: number,
    value: SearchResponseValue[]
}

interface SearchResponseValue{
    id: string,
    name: string,
    url: string,
    displayUrl: string,
    snippet: string,
    dateLastCrawled: Date
}

// define the schema for our user model
var recipeSchema = mongoose.Schema({
    name: String,
    description: String,
    cookTime: Date,
    cookingMethod: String,
    nutrition: String,
    prepTime: Date,
    recipeCategory: String,
    recipeCuisine: String,
    recipeIngredient: Array,
    recipeInstructions: Array,
    recipeYield: String,
    suitableForDiet: String,
    totalTime: Date
});


const bingSearchKey = "b628f2efb6b04d3ab60644b0feb313de";

const bingSearchRecipe = (query, callback) => {
    let client = createJsonClient('https://api.cognitive.microsoft.com');
    query = encodeURIComponent(query + " recipe");
    let options = {
        path: "/bing/v5.0/search?q=" + query + "&count=10&offset=0&mkt=en-gb&safeSearch=Moderate",
        headers: {
            'Ocp-Apim-Subscription-Key': bingSearchKey
        }
    };

    client.get(options, function (err, req, res, obj) {
        callback(obj.value);
    });
}

//Dialog
bot.dialog('/search', [
    (session) => {
        bingSearchRecipe("chocolate cupcakes", (result) => {
            //do something
        });
    }
]);



