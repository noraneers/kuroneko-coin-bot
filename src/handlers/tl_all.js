const fs = require('fs')
const path = require('path')
const debug = require('debug')

const botUtil = require('./botUtil')

module.exports = (controller) => {
  controller.on('ambient', (bot, message)=> {
    console.log(message)

    bot.reply({
      'channel': 'CDQMKBULA'
    }, botUtil.getPermalink(message), (err, response)=> {
      // bot.createConversation(response.message, (e, convo)=> {
      //     // create a path for when a user says YES
      //   convo.addMessage({
      //     text: 'You said yes! How wonderful.'
      //   },'yes_thread')
      //   convo.activate()
      // })
    })

    // convo.addMessage({
    //   text: 'This is the next step...',
    // }, 'next_step');

  })

}