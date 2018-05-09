const {BOT_CONFIG, SLACK_TOKEN, SLACK_DEBUG, SLACK_WEBHOOK_URL} = require("./../config")
const winston = require('winston')

let controller, bot;

if(process.env.NODE_ENV == 'test'){
  const Botmock = require('botkit-mock')

  // TODO: validation for test

  // controller = Botmock({
  //   disable_startup_messages: true,
  //   debug: false,
  //   logger: {
  //     log: ()=>{}
  //   }
  // })

  // bot = controller.spawn({
  //   type: 'slack',
  //   afterProcessingUserMessageTimeout: 2300,
  // })
  controller = null
  bot = null
}else{
  const Botkit = require("botkit");

  controller = Botkit.slackbot({
    clientId: BOT_CONFIG.clientId,
    clientSecret: BOT_CONFIG.clientSecret,
    scopes: ['bot'],
    logger: winston.loggers.get('botkit')
  }).configureSlackApp(
    BOT_CONFIG
  );

  bot = controller.spawn({
    token: SLACK_TOKEN,
    debug: SLACK_DEBUG,
    retry: 1000
  })
}

module.exports = {
  bot: bot,
  controller: controller,
  botApi: bot.api,
}