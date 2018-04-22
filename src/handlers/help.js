const fs = require('fs')
const path = require('path')
const debug = require('debug')

module.exports = (controller) => {
  controller.hears('help', ['direct_mention', 'direct_message'], (bot, message) => {
    bot.reply(message, __('help'));
  })
}