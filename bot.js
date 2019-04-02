// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ActionTypes, ActivityTypes, CardFactory, AttachmentLayoutTypes } = require('botbuilder');

var Memoria = function(_id,_url){
    this.id = _id,
    this.url = _url
    }

var Memorias = [];
Memorias.push(new Memoria(2017,'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaFalabella2017_SVS_(finalwebIR)-(1).pdf'));
Memorias.push(new Memoria(2016,'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaSVS-2016.pdf'));
Memorias.push(new Memoria(2015,'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaFalabellaSVS.pdf'));
Memorias.push(new Memoria(2014,'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaEnviadaSVS_20140424.pdf'));
Memorias.push(new Memoria(2013,'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/2013-Memoria-SVS.pdf'));
/**
 * A simple bot that responds to utterances with answers from the Language Understanding (LUIS) service.
 * If an answer is not found for an utterance, the bot responds with help.
 */
class LuisBot {
    /**
     * The LuisBot constructor requires one argument (`application`) which is used to create an instance of `LuisRecognizer`.
     * @param {LuisApplication} luisApplication The basic configuration needed to call LUIS. In this sample the configuration is retrieved from the .bot file.
     * @param {LuisPredictionOptions} luisPredictionOptions (Optional) Contains additional settings for configuring calls to LUIS.
     */
    constructor(application, luisPredictionOptions, includeApiResults) {
        this.luisRecognizer = new LuisRecognizer(application, luisPredictionOptions, true);
    }
    /**
     * Every conversation turn calls this method.
     * There are no dialogs used, since it's "single turn" processing, meaning a single request and
     * response, with no stateful conversation.
     * @param {TurnContext} turnContext A TurnContext instance, containing all the data needed for processing the conversation turn.
     */
    async onTurn(turnContext) {

        
        // By checking the incoming Activity type, the bot only calls LUIS in appropriate cases.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Perform a call to LUIS to retrieve results for the user's message.
            const results = await this.luisRecognizer.recognize(turnContext);
            const input = turnContext.activity.text;
            console.log('Texto enviado ',input)
            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;
            if(topIntent.intent === 'Saludo'){
                await LuisBot.EnviarSaludos(turnContext)
            }
            else if (topIntent.intent === 'Memoria'){
                await LuisBot.MostrarCarruselMemorias(turnContext);
            }
            else if (topIntent.intent !== 'None') {
                await turnContext.sendActivity(`LUIS Top Scoring Intent: ${ topIntent.intent }, Score: ${ topIntent.score }`);
            } else {
                // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
                await turnContext.sendActivity(`No LUIS intents were found.
                                                \nThis sample is about identifying two user intents:
                                                \n - 'Calendar.Add'
                                                \n - 'Calendar.Find'
                                                \nTry typing 'Add Event' or 'Show me tomorrow'.`);
            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.recipient.id !== turnContext.activity.membersAdded[0].id) {
            // If the Activity is a ConversationUpdate, send a greeting message to the user.
            await turnContext.sendActivity('Bienvenido al Asistente Virtual. 👨‍💻 Realiza las preguntas que tengas y yo te daré la respuesta 👍');
        } else if (turnContext.activity.type !== ActivityTypes.ConversationUpdate) {
            // Respond to all other Activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type }]-type activity detected.`);
        }
    }

    // Manages the conversation flow for filling out the user's profile.
    static async EnviarSaludos(turnContext) {

        await turnContext.sendActivities([
            {type: 'typing'},
            {type: 'delay', value: 2000},
            {type: 'message', text: 'Gracias por saludar!!! 🥰' }
        ]);

        await turnContext.sendActivities([
            {type: 'typing'},
            {type: 'delay', value: 2000},
            {type: 'message', text: 'Si bien me crearon como un piloto, ya se muchas cosas las cuales podria presentarte 😎' }
        ]);

        await turnContext.sendActivities([
            {type: 'typing'},
            {type: 'delay', value: 2000},
            {type: 'message', text: 'Estoy preparando la información... 🤯' },
            {type: 'typing'},
            {type: 'delay', value: 1000},
            {type: 'message', text: '👨‍🎓👨‍🎓' }
        ]);

        await LuisBot.MenuOpciones(turnContext);
    }

    static async MostrarCarruselMemorias(turnContext){
// await turnContext.sendActivities([
//     {type:'typing'},
//     {type:'delay', value: 1500}
// ])

        await turnContext.sendActivity({
            text: 'Selecciona un año:',
            attachments: [LuisBot.MemoriaCard(Memorias[0].id,Memorias[0].url),
                          LuisBot.MemoriaCard(Memorias[1].id,Memorias[1].url),
                          LuisBot.MemoriaCard(Memorias[2].id,Memorias[2].url),
                          LuisBot.MemoriaCard(Memorias[3].id,Memorias[3].url),
                          LuisBot.MemoriaCard(Memorias[4].id,Memorias[4].url)                         
         ],
            attachmentLayout: AttachmentLayoutTypes.Carousel

        });
    }

    static MemoriaCard(id,url) {
        return CardFactory.heroCard(
            id+' Reporte Anual',
            CardFactory.images([__dirname +'/resources/img/'+'MemoriaFalabella'+id+'.png']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Descargar Memoria',
                    value: url
                }
            ])
    
        );
    }

    static async MenuOpciones(turnContext){

        const buttons = [
            { type: ActionTypes.ImBack, title: '1. Mostrar ImBack', value: 'You can All hear me! Shout out loud' },
            { type: ActionTypes.PostBack, title: '2. Mostrar PostBack', value: 'Shhhh! My bot friend hears me. Much Quieter' },
            { type: ActionTypes.OpenUrl, title: '3. Mostrar OpenUrl', value: 'https://www.google.cl' },
            { type: ActionTypes.Call, title: '4. Mostrar Call', value: 'tel:123123123123' },
            { type: ActionTypes.PlayAudio, title: '5. Mostrar PlayAudio', value: '5' },
            { type: ActionTypes.PlayVideo, title: '6. Mostrar PlayVideo', value: 'https://youtu.be/ltYUH6fEYdE' },
            { type: ActionTypes.ShowImage, title: '7. Mostrar ShowImage', value: 'https://www.debate.com.mx/__export/1523551113292/sites/debate/img/2018/04/12/meme.png_1902800913.png' }
        ];
        const card = CardFactory.heroCard('Opciones disponibles', undefined,
        buttons, { text: 'Selecciona la opción que desees' });

        // add card to Activity.
        const reply = { type: ActivityTypes.Message };
        reply.attachments = [card];

        // Send hero card to the user.
        await turnContext.sendActivities([
            {type: 'delay', value: 1000},
            {type: 'message', text: 'Esto es lo que encontré para ti... 😀 😀 😀 😀'},
            {type: 'typing'},
            {type: 'delay', value: 1000}
            ]                    
        );

        await turnContext.sendActivity(reply)

    }

    // Validates name input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateName(input) {
        const name = input && input.trim();
        return name != undefined
            ? { success: true, name: name }
            : { success: false, message: 'Please enter a name that contains at least one character.' };
    };

    // Validates age input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateAge(input) {

        // Try to recognize the input as a number. This works for responses such as "twelve" as well as "12".
        try {
            // Attempt to convert the Recognizer result to an integer. This works for "a dozen", "twelve", "12", and so on.
            // The recognizer returns a list of potential recognition results, if any.
            const results = Recognizers.recognizeNumber(input, Recognizers.Culture.English);
            let output;
            results.forEach(function (result) {
                // result.resolution is a dictionary, where the "value" entry contains the processed string.
                const value = result.resolution['value'];
                if (value) {
                    const age = parseInt(value);
                    if (!isNaN(age) && age >= 18 && age <= 120) {
                        output = { success: true, age: age };
                        return;
                    }
                }
            });
            return output || { success: false, message: 'Please enter an age between 18 and 120.' };
        } catch (error) {
            return {
                success: false,
                message: "I'm sorry, I could not interpret that as an age. Please enter an age between 18 and 120."
            };
        }
    }

    // Validates date input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateDate(input) {
        // Try to recognize the input as a date-time. This works for responses such as "11/14/2018", "today at 9pm", "tomorrow", "Sunday at 5pm", and so on.
        // The recognizer returns a list of potential recognition results, if any.
        try {
            const results = Recognizers.recognizeDateTime(input, Recognizers.Culture.English);
            const now = new Date();
            const earliest = now.getTime() + (60 * 60 * 1000);
            let output;
            results.forEach(function (result) {
                // result.resolution is a dictionary, where the "values" entry contains the processed input.
                result.resolution['values'].forEach(function (resolution) {
                    // The processed input contains a "value" entry if it is a date-time value, or "start" and
                    // "end" entries if it is a date-time range.
                    const datevalue = resolution['value'] || resolution['start'];
                    // If only time is given, assume it's for today.
                    const datetime = resolution['type'] === 'time'
                        ? new Date(`${now.toLocaleDateString()} ${datevalue}`)
                        : new Date(datevalue);
                    if (datetime && earliest < datetime.getTime()) {
                        output = { success: true, date: datetime.toLocaleDateString() };
                        return;
                    }
                });
            });
            return output || { success: false, message: "I'm sorry, please enter a date at least an hour out." };
        } catch (error) {
            return {
                success: false,
                message: "I'm sorry, I could not interpret that as an appropriate date. Please enter a date at least an hour out."
            };
        }
    }

}

module.exports.LuisBot = LuisBot;
