// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ActionTypes, ActivityTypes, CardFactory, AttachmentLayoutTypes } = require('botbuilder');
const axios = require("axios");

UF_API_KEY= 'https://api.sbif.cl/api-sbifv3/recursos_api/uf?apikey=84a7b1396b178aabf3c912f62059b43a25dbae09&formato=JSON';

//UFDIAS_API_KEY = 'https://api.sbif.cl/api-sbifv3/recursos_api/uf/posteriores/{year}/{month}/dias/{day}?apikey=84a7b1396b178aabf3c912f62059b43a25dbae09&formato=JSON';

UFDIAS_API_KEY = 'https://api.sbif.cl/api-sbifv3/recursos_api/uf/2018/04?apikey=84a7b1396b178aabf3c912f62059b43a25dbae09&formato=JSON';


var Memoria = function (_id, _url) {
    this.id = _id,
        this.url = _url
}

var Memorias = [];
Memorias.push(new Memoria(2017, 'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaFalabella2017_SVS_(finalwebIR)-(1).pdf'));
Memorias.push(new Memoria(2016, 'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaSVS-2016.pdf'));
Memorias.push(new Memoria(2015, 'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaFalabellaSVS.pdf'));
Memorias.push(new Memoria(2014, 'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/MemoriaEnviadaSVS_20140424.pdf'));
Memorias.push(new Memoria(2013, 'https://s22.q4cdn.com/351912490/files/doc_financials/annual_spanish/2013-Memoria-SVS.pdf'));
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
            console.log('Texto enviado ', input)
            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;
            if (topIntent.intent === 'Saludo') {
                await LuisBot.EnviarSaludos(turnContext)
            }
            else if (topIntent.intent === 'Memoria') {
                await LuisBot.MostrarCarruselMemorias(turnContext);
            }
            else if (topIntent.intent === 'Video') {
                await LuisBot.GenerarVideoCard(turnContext);
            }
            else if (topIntent.intent === 'ListaContacto') {
                await LuisBot.CarruselListaContactos(turnContext);
            }
            else if (topIntent.intent === 'Opciones') {
                await LuisBot.MenuOpciones(turnContext);
            }
            else if (topIntent.intent === 'Descargar') {
                await LuisBot.filesAttachment(turnContext)
            }
            else if (topIntent.intent === 'Adjuntar') {
                await LuisBot.AdjuntarArchivo(turnContext)
            }
            else if (topIntent.intent === 'Valoruf') {
                await LuisBot.ValorUF(turnContext)
            }
            else {
                // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
                await turnContext.sendActivity(`No pude entender lo que me preguntas... 😰😰😰
                                                \n 
                                                \nTen paciencia... me estan enseñando cosas nuevas todos los días para poder entenderte mejor.😉😉`);

                await LuisBot.AyudarenAlgoMas(turnContext);
            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.recipient.id !== turnContext.activity.membersAdded[0].id) {
            // If the Activity is a ConversationUpdate, send a greeting message to the user.
            await turnContext.sendActivity('Bienvenido al Asistente Virtual. 👨‍💻 Realiza las preguntas que tengas y yo te daré la respuesta 👍');
        } else if (turnContext.activity.type !== ActivityTypes.ConversationUpdate) {
            // Respond to all other Activity types.
            await turnContext.sendActivity(`[${turnContext.activity.type}]-type activity detected.`);
        }
    }

    static async GenerarVideoCard(turnContext) {

        await turnContext.sendActivities(
            [
                { type: 'typing' },
                { type: 'delay', value: 2000 },
                { type: 'message', text: 'Por el momento solo tengo información de un video... Estoy recopilando más videos para poder presentarte!!!' },
                { type: 'delay', value: 3000 },
                { type: 'message', text: 'Te voy a presentar información sobre un campeonato de proyectos innovadores... Te va a encantar ❤️' },
                { type: 'typing' },
                { type: 'delay', value: 4000 },

            ]
        )

        const video = CardFactory.videoCard(
            'Campeonato Mundial de IC18 World Championship',
            [{ url: 'https://sec.ch9.ms/ch9/783d/d57287a5-185f-4df9-aa08-fcab699a783d/IC18WorldChampionshipIntro2.mp4' }],
            [{
                type: 'openUrl',
                title: 'Conocer más',
                value: 'https://channel9.msdn.com/Events/Imagine-Cup/World-Finals-2018/2018-Imagine-Cup-World-Championship-Intro'
            }],
            {
                subtitle: 'by Microsoft',
                text: 'Microsoft\'s Imagine Cup es un evento para estudiantes innovadores alrededor del mundo, con el objetivo de crear proyectos innovadores y que tragan beneficio a la comunidad.',
            }
        )


        await turnContext.sendActivity(
            {
                attachments: [video]
            }
        )

        await LuisBot.AyudarenAlgoMas(turnContext)

    }



    static async EnviarSaludos(turnContext) {

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 2000 },
            { type: 'message', text: 'Gracias por saludar!!! 🥰' }
        ]);

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 2000 },
            { type: 'message', text: 'Si bien me crearon como un piloto, ya se muchas cosas las cuales podria presentarte 😎' }
        ]);

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 2000 },
            { type: 'message', text: 'Estoy preparando la información... 🤯' },
            { type: 'typing' },
            { type: 'delay', value: 1000 },
            { type: 'message', text: '👨‍🎓👨‍🎓' }
        ]);

        await LuisBot.MenuOpciones(turnContext);
    }

    static async CarruselListaContactos(turnContext) {


        await turnContext.sendActivity({
            text: 'Estos son los miembros de la empresa:',
            attachments: [LuisBot.CrearTarjetaListaContacto(),
            LuisBot.CrearTarjetaListaContacto(),
            LuisBot.CrearTarjetaListaContacto(),
            LuisBot.CrearTarjetaListaContacto(),
            LuisBot.CrearTarjetaListaContacto()
            ],
            attachmentLayout: AttachmentLayoutTypes.Carousel

        });

        await LuisBot.AyudarenAlgoMas(turnContext)

    }

    static CrearTarjetaListaContacto() {
        return CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "size": "Medium",
                            "weight": "Bolder",
                            "text": "Tarjeta de Contacto"
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "Image",
                                            "style": "Person",
                                            "url": "https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg",
                                            "size": "Small"
                                        }
                                    ],
                                    "width": "auto"
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "weight": "Bolder",
                                            "text": "Matt Hidinger",
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "spacing": "None",
                                            "text": "Miembro de la empresa desde el {{DATE(2017-02-14T06:08:39Z,SHORT)}}",
                                            "isSubtle": true,
                                            "wrap": true
                                        }
                                    ],
                                    "width": "stretch"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Telefono: [9821098398](tel:9821098398)",
                            "wrap": true
                        },
                        {
                            "type": "TextBlock",
                            "horizontalAlignment": "Left",
                            "text": "Correo Electrónico: mhidinger@empresa.com"
                        },
                        {
                            "type": "TextBlock",
                            "text": "Departamento: Finanzas"
                        }
                    ]
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        }
        )

    }

    static async MostrarCarruselMemorias(turnContext) {

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 2000 },
            { type: 'message', text: '🔍🔎 🔍🔎 Deja buscar a ver si encuentro algo en mi biblioteca de registros... 🔍🔎 🔍🔎' },
            { type: 'typing' },
            { type: 'delay', value: 3000 }
        ])

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1500 },
            { type: 'message', text: 'Buscando en mis registros... He encontrado los siguientes reportes anuales...  📄 📑 📊' },
            { type: 'typing' },
            { type: 'delay', value: 3000 }
        ])

        await turnContext.sendActivity({
            text: 'Selecciona un año:',
            attachments: [LuisBot.MemoriaCard(Memorias[0].id, Memorias[0].url),
            LuisBot.MemoriaCard(Memorias[1].id, Memorias[1].url),
            LuisBot.MemoriaCard(Memorias[2].id, Memorias[2].url),
            LuisBot.MemoriaCard(Memorias[3].id, Memorias[3].url),
            LuisBot.MemoriaCard(Memorias[4].id, Memorias[4].url)
            ],
            attachmentLayout: AttachmentLayoutTypes.Carousel

        });

        await LuisBot.AyudarenAlgoMas(turnContext)
    }

    static MemoriaCard(id, url) {
        return CardFactory.heroCard(
            id + ' Reporte Anual',
            CardFactory.images([__dirname + '/resources/img/' + 'MemoriaFalabella' + id + '.png']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Descargar Memoria',
                    value: url
                }
            ])

        );
    }

    static UFCard(uf,valor,fecha) {
        return CardFactory.heroCard(
            'Valor UF : ' + uf ,
            CardFactory.images(["https://quickchart.io/chart?c={type:'line',data:{labels:["+fecha+"], datasets:[{label:'UF',data:["+valor+"]}]},options:{scales:{Axes:[{ticks:{beginAtZero: true}}]}}}"]),
            //CardFactory.images(['']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Mas Indicadores - Sitio SII',
                    value: 'http://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html'
                }
            ])
    
        );   
    }   
   
    static  urlHistorico(){
        var d = new Date(); 
        d.setDate(d.getDate() - 15); 
        var year = d.getUTCFullYear();
        var month = d.getUTCMonth()+1;
        var day = d.getUTCDate();
        var URL = UFDIAS_API_KEY.replace('{year}',year).replace('{month}',month).replace('{day}',day);
        return URL;
    }
    static async filesAttachment(turnContext) {
        let pdffile = __dirname + '/resources/files/pdf/Q1.pdf'
        let pdf = {
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
                buttons: [{
                    title: 'Descargar',
                    type: 'downloadFile',
                    value: pdffile
                }],
                title: 'Archivo PDF'
            }
        }
        let imgfile = __dirname + '/resources/files/img/falabella.png'
        let img = {
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
                buttons: [{
                    title: 'Descargar',
                    type: 'downloadFile',
                    value: imgfile
                }],
                title: 'Imagen'
            }
        }
        let docxfile = __dirname + '/resources/files/office/Documento_Word.docx'
        let docx = {
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
                buttons: [{
                    title: 'Descargar',
                    type: 'downloadFile',
                    value: docxfile
                }],
                title: 'Documento Word'
            }
        }
        let excelfile = __dirname + '/resources/files/office/Documento_Excel.xlsx'
        let excel = {
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
                buttons: [{
                    title: 'Descargar',
                    type: 'downloadFile',
                    value: excelfile
                }],
                title: 'Archivo Excel'
            }
        }

        await turnContext.sendActivity({
            text: 'Archivos',
            attachments: [pdf, img, docx, excel],

        });

        await LuisBot.AyudarenAlgoMas(turnContext)
    }

    static async AyudarenAlgoMas(turnContext) {
        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 1500 },
            { type: 'message', text: 'Te puedo ayudar en algo más???... 👀 ' }
        ])
    }

    static async ValorUF(turnContext) {

        await turnContext.sendActivities([
            { type: 'typing' },
            { type: 'delay', value: 2000 },
            { type: 'message', text: 'un momento' }
        ]);

        try {
            const response = await axios.get(UF_API_KEY);
            const res_historico = await axios.get(LuisBot.urlHistorico());
            const infohist = res_historico.data;
            var c = '';
            var valor='';
            var fecha='';
            for (let i = 0; i < infohist.UFs.length; i++)
            {
              valor +=  c + "'"+infohist.UFs[i].Valor.replace('.','').replace(',','.')+"'";
              fecha +=  c + "'"+infohist.UFs[i].Fecha+"'";
              c = ',';
            }
            const info = response.data;
            await context.sendActivity({ 
                      text: 'Valor de la UF al Dia: '+info.UFs[0].Fecha,
                      attachments: [ LuisBot.UFCard(info.UFs[0].Valor,valor,fecha)]
                  }); 
      //  console.log("https://quickchart.io/chart?c={type:'line',data:{labels:["+fecha+"], datasets:[{label:'UF',data:["+valor+"]}]}}");
          } catch (error) {
            console.log(error);
          }        
        await LuisBot.MenuOpciones(turnContext);
    }

    static async MenuOpciones(turnContext) {

        const buttons = [
            { type: ActionTypes.ImBack, title: '1. Mostrar Video', value: 'Video' },
            { type: ActionTypes.PostBack, title: '2. Ver Reportes Anuales', value: 'Reporte' },
            { type: ActionTypes.OpenUrl, title: '3. Mostrar Página de la empresa', value: 'https://www.falabella.cl' },
            { type: ActionTypes.PostBack, title: '4. Ver Lista de Contactos ', value: 'Lista de Contacto' },
            { type: ActionTypes.PostBack, title: '5. Mostrar Archivos Adjuntos ', value: 'Descargar Archivos' },
            // { type: ActionTypes.PostBack, title: '6. Adjuntar archivo ', value: 'Adjuntar Archivo' },
            { type: ActionTypes.Call, title: '6. Llamar a Mesa de Ayuda', value: 'tel:123123123123' }
        ];
        const card = CardFactory.heroCard('Opciones disponibles', undefined,
            buttons, { text: 'Selecciona la opción que desees' });

        // add card to Activity.
        const reply = { type: ActivityTypes.Message };
        reply.attachments = [card];

        // Send hero card to the user.
        await turnContext.sendActivities([
            { type: 'delay', value: 1000 },
            { type: 'message', text: 'Esto es lo que encontré para ti... 😀 😀 😀 😀' },
            { type: 'typing' },
            { type: 'delay', value: 1000 }
        ]
        );

        await turnContext.sendActivity(reply)

    }

}

module.exports.LuisBot = LuisBot;
