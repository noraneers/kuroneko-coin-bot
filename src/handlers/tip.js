const fs = require('fs')
const path = require('path')
const util = require('util');

const debug = require('debug')

const { User, UserMethods } = require('../models/User')

const SmartPay = require('../smartpay')
const botUtil = require('./botUtil')

module.exports = (controller) => {

  const userIdPattern = /<@([A-Z\d]+)>/ig;
  const amountPattern = /([\d\.]*)/ig;

  controller.hears([
    `tip ${userIdPattern.source} ${amountPattern.source}`,
    `tip ${userIdPattern.source} ${amountPattern.source} (.*)`
  ], ["direct_mention", "direct_message"], (bot, message) => {

    try {
      const senderId = message.user;
      const recieverId = message.match[1];
      const amount = Number(message.match[2]);
      const txMessage = message.match[3] || "no message";

      const confirmText = __('tip.confirm', UserMethods.formatUser(senderId), UserMethods.formatUser(recieverId), amount, process.env.COIN_UNIT);

      bot.replyAndUpdate(message, confirmText, (err, scripts, updateResponse)=> {
        const smartpay = new SmartPay(senderId, recieverId, amount, `tip:${txMessage}`)
        smartpay.payOffChain().then((result) => {
          const [sender, reciever] = result.users;
          const successText = __('tip.success', UserMethods.formatUser(senderId), UserMethods.formatUser(recieverId), amount, process.env.COIN_UNIT);
          updateResponse(successText, console.error);

          // TODO Write test LATER
          botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amount, sender)
          botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amount, reciever, txMessage)

          }).catch(async (err)=> {
            const sender = await UserMethods.findOneById(senderId)
            bot.reply(message, __('tip.error'))
            botUtil.replyOnBotChannel(bot, message, err.message, sender)
            botUtil.replyBlanceOnBotChannel(bot, message, sender)
          })
      })
    } catch(err) {
      bot.reply(message, err.name + ':' + err.message)
      console.error(err);
    }
  })
}
