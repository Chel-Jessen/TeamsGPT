const axios = require("axios");
const { TeamsActivityHandler, MessageFactory, TurnContext } = require("botbuilder");
const { Configuration, OpenAIApi } = require("openai");


class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    

    this.onMessage(async (context, next) => {

      let txt = context.activity.text;
      let user = context.activity.from.id;

      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      if (removedMentionText) {
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      // You can change the OpenAI configurations
      // Please insert your organization (https://beta.openai.com/account/org-settings) and API-key (https://beta.openai.com/account/api-keys)
      const configuration = new Configuration({
        organization: "org-XXXXXXXXXXXXXXX",
        apiKey: "sk-XXXXXXXXXXXXXXXXXX",
      });
      
      // change 'max_tokens' to increase or lessen the maximum allowed tokens to use per request
      let max_tokens = 1000;
      const openai = new OpenAIApi(configuration);
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: txt,
        max_tokens: max_tokens,
        temperature: 0.5,
        user: user,
      });

      if(response.status == 401){
        const reply = MessageFactory.text("Invalid API-KEY!");
        await context.sendActivity(reply);
      }
      if(response.status == 429){
        const reply = MessageFactory.text("Too many requests on the server!");
        await context.sendActivity(reply);
      }
      if(response.status == 500){
        const reply = MessageFactory.text("OpenAI's servers are down!");
        await context.sendActivity(reply);
      }
      
      if(response.data.choices[0]["text"]){
        const response_text = response.data.choices[0]["text"];
        const reply = MessageFactory.text(response_text);
        await context.sendActivity(reply);
      }
      else{
        const reply = MessageFactory.text("Unknown error occurred!");
        await context.sendActivity(reply);
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}


module.exports.TeamsBot = TeamsBot;
