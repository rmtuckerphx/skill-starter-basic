'use strict';
var Alexa = require('alexa-sdk');

var _ = require('lodash');

var Translations = require('./translations');
var Constants = require('./constants.json');
var Util = require('./util');
var FactsHelper = require('./factsHelper');

exports.handler = function (event, context, callback) {
    var useLocalResources = event.request.debug;
    // useLocalResources = true;

    Translations.getResources(useLocalResources)
        .then(function (data) {

            var alexa = Alexa.handler(event, context);
            alexa.appId = Constants.skillAppID;
            // alexa.dynamoDBTableName = Constants.dynamoDBTableName;
            // alexa.mobileAnalyticsSettings = Constants.mobileAnalyticsSettings;
            alexa.resources = data;
            alexa.registerHandlers(mainHandlers);
            alexa.execute();
        })
        .catch(function (err) {

            console.log(err.message);
        });
};

var mainHandlers = {
    'LaunchRequest': function () {
        var welcome = this.t('welcome', this.t('skill.name'));

        // store in attributes, so that Repeat works
        this.attributes.speechOutput = welcome.speechOutput;
        this.attributes.repromptSpeech = welcome.reprompt;

        this.emit(':ask', welcome.speechOutput, welcome.reprompt);
    },
    'GetNewFactIntent': function () {
        var index = Util.getNextIndex(this.t('facts'), this.attributes, 'visitedFactIndexes', Util.nextIndexOptions.Random);
        FactsHelper.emitFactByNumber.call(this, index + 1);
    },
    'GetFactByNumberIntent': function () {
        var number = parseInt(this.event.request.intent.slots.number.value);
        FactsHelper.emitFactByNumber.call(this, number);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech)
    },
    'AMAZON.HelpIntent': function () {
        var sampleCommands = this.t('sampleCommands');
        var text = _.sampleSize(sampleCommands, 4).join(' ');       
        var speechOutput = this.t('help.speechOutput', text);

        var reprompt = this.t('help.reprompt');

        this.attributes.speechOutput = speechOutput;
        this.attributes.repromptSpeech = reprompt;

        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        var goodbye = this.t('goodbye');

        this.attributes.speechOutput = ' ';
        this.attributes.repromptSpeech = ' ';

        // :tell* or :saveState handlers required here to save attributes to DynamoDB
        this.emit(':tell', goodbye.speechOutput); 
    },
    'Unhandled': function () {
        var unhandled = this.t('unhandled');

        this.attributes.speechOutput = unhandled.speechOutput;
        this.attributes.repromptSpeech = unhandled.reprompt;

        this.emit(':ask', unhandled.speechOutput, unhandled.reprompt);
    }
};