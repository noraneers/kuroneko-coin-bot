const util = require('util');
const path = require('path');

const botUtil = require('./botUtil')

const { User, UserMethods } = require('../models/User')

// @gpbot balance
module.exports = (controller) => {

  const options = ['all', 'deposit', 'wallet'];
  const optionExp = '('+options.join('|')+')'

  controller.hears([
    `^balance ${UserMethods.getUserIdPattern(true)} ${optionExp}$`,
    `^balance ${UserMethods.getUserIdPattern(true)}$`,
    `^balance ${optionExp}$`,
    `^balance$`,
  ], ["direct_mention", "direct_message"], (bot, message)=> {

    const option = message.match[2] || ((options.indexOf(message.match[1]) !== -1) ? message.match[1] : 'deposit');
    const userId =  (options.indexOf(message.match[1]) === -1) && message.match[1] ||  message.user;

    bot.replyAndUpdate(message, 'Fetching Now ...', async(err, scripts, updateResponse)=> {
      if(err) throw new Error('Error:replyAndUpdate')
      try {
        const user = await UserMethods.upsertOne({id: userId},{id: userId})
        let totalBalance = 0;
        if(['all', 'deposit'].indexOf(option) !== -1){
          totalBalance += user.balance + user.paddingBalance
        }
        const blanceText = botUtil.getBlanceText(user, totalBalance)
        updateResponse(blanceText, console.error)
      } catch(err) {
        console.error(err);
        bot.reply(message, err.name + ':' + err.message)
      }
    })
  })
}