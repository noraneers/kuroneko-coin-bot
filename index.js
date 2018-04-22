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
  'member'
]

if(commands && commands.length > 0){
  const {bot, controller} = require(path.join(__dirname, 'src', 'bot'))()
  commands.forEach( (command, index)=> require(`./src/handlers/${command}`)(controller) );
}