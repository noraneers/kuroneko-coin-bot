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
    `notification (on|off)$`,
    `notification$`
  ], ["direct_mention", "direct_message"], async (bot, message) => {
    try {
      const senderId = message.user;

      if (!message.match[1]){
        const user = await UserMethods.upsertOneById(senderId)
        bot.reply(message, __('notification.status', user.notification ? 'on' : 'off'))
        return
      }

      const isOn = message.match[1] == 'on' ? true : false;

      UserMethods.upsertOneById(senderId, {
        notification: isOn
      }).then(() => {
        bot.reply(message, __('notification.success', message.match[1]))
      }, (e)=>{
        bot.reply(message, __('notification.error'))
      })
    } catch(err) {
      bot.reply(message, err.name + ':' + err.message)
      console.error(err);
    }
  })
}
