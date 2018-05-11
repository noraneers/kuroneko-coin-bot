'use strict'
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const debug = require('debug')
const { User, UserMethods } = require('../models/User')

class BotUtil {
  getBlanceText(user, balance){
    balance = balance || user.balance
    return __('balance.success', UserMethods.formatUser(user.id), balance, process.env.COIN_UNIT)
  }

  getPermalink(message){
    const targetMessage = message.item || message
    const ts = targetMessage.ts? targetMessage.ts.replace('.', '') : null
    return ts? `https://${process.env.SLACK_WORKSPACE}.slack.com/archives/${targetMessage.channel}/p${ts}` : ''
  }

  replySuccessTxOnBotChannel(bot, message, senderId, recieverId, amount, user, titleText=''){
    const txText = __('transaction.success', UserMethods.formatUser(senderId), UserMethods.formatUser(recieverId), amount, process.env.COIN_UNIT)
    const balanceText = this.getBlanceText(user);
    const permalink = this.getPermalink(message)
    this.replyOnBotChannel(bot, message, [titleText, txText, balanceText, permalink], user)
  }

  replyBlanceOnBotChannel(bot, message, user){
    const text = this.getBlanceText(user);
    this.replyOnBotChannel(bot, message, text, user)
  }

  replyOnBotChannel(bot, message, texts, user){
    texts = Array.isArray(texts)? texts : [texts];
    return new Promise((resolve, reject) => {
      bot.api.im.list({},(err,response)=> {
        if(err){
          reject(err)
        }
        // || it's just for TEST.  TODO: Change separalte test data
        const ims = response && response.ims
        for (var i = ims.length - 1; i >= 0; i--) {
          const im = ims[i];
          if (user.id && user.id == im.user && user.notification) {
            bot.reply({
              'channel': im.id
            }, texts.join('\n'))
            resolve(message.user)
            break;
          }
        }
      })
    })
  }
}

module.exports = new BotUtil()

