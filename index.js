'use strict'
require('dotenv').config({path: '../.env'});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const path = require('path');

const { mongoose } = require(path.join(__dirname, 'src', 'db'))

const commands = [
  'balance',
  'tip',
  'reaction',
  'rain',
  'help',
  'notification',
  'member'
]

if(commands && commands.length > 0){
  const { bot, controller } = require(path.join(__dirname, 'src', 'bot'))
  const { SLACK_WEBHOOK_URL } = require("./config");

  bot.startRTM((err) => {
    if (err) {
      throw new Error(err);
    }
  })

  bot.configureIncomingWebhook({
    url: SLACK_WEBHOOK_URL
  })

  controller.on('rtm_reconnect_failed',function(bot) {
    console.log('\n\n*** '+moment().format() + ' ** Unable to automatically reconnect to rtm after a closed conection.')
  })

  commands.forEach( (command, index)=> require(`./src/handlers/${command}`)(controller) );
}