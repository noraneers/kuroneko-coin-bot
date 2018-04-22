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
    `rain ${amountPattern.source}`,
    `rain ${amountPattern.source} (.*)`
  ], ["direct_mention", "direct_message"], (bot, message) => {

    try {
      const senderId = message.user;
      const amount = Number(message.match[1]);
      const txMessage = message.match[2] || "no message";

      const channelPromise = new Promise((resolve, reject) => {
        bot.api.channels.info({
          channel: message.channel,
        }, (err, res) => {
          if(err) reject(err)
          else resolve(res.channel)
        });
      });

      const usersPromise = new Promise((resolve, reject) => {
        bot.api.users.list({
        }, (err, res) => {
          if(err) reject(err)
          else resolve(res.members)
        });
      });

      Promise.all([channelPromise, usersPromise]).then((data)=>{
        const channel = data[0];
        const members = data[1];

        const recieverIds = members.filter((member)=>{
          return (
            member.id !== senderId &&
            !member.is_bot &&
            // member.presence === 'active' &&
            channel.members.indexOf(member.id) !== -1
          )
        }).map(member=>member.id)

        const recieverFormatedIds = recieverIds.map((memberId)=>{
          return UserMethods.formatUser(memberId)
        })

        const amountPerUser = Math.floor( amount/recieverIds.length );
        const confirmText = __('tip.confirm', UserMethods.formatUser(senderId), recieverFormatedIds.join(' , ') , amountPerUser, process.env.COIN_UNIT)

        bot.replyAndUpdate(message, confirmText, (err, scripts, updateResponse)=> {
          const smartpayPromises = recieverIds.map((recieverId)=>{
            const smartpay = new SmartPay(senderId, recieverId, amountPerUser)
            return smartpay.payOffChain()
          })
          Promise.all(smartpayPromises).then((results)=>{
            let successTexts = []
            results.forEach((result, index)=> {
              const [sender, reciever] = result.users;
              const successText = __('tip.success', UserMethods.formatUser(sender.id), UserMethods.formatUser(reciever.id), amountPerUser, process.env.COIN_UNIT)
              successTexts.push(successText)
              botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amountPerUser, sender)
              botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amountPerUser, reciever, txMessage)
            });
            updateResponse(successTexts.join('\n'), console.error);
          }).catch(async (err)=> {
            const sender = await UserMethods.findOneById(senderId)
            bot.reply(message, __('tip.error'))
            botUtil.replyOnBotChannel(bot, message, err.message, sender)
            botUtil.replyBlanceOnBotChannel(bot, message, sender)
          })
        })
      })
    } catch(err) {
      bot.reply(message, err.name + ':' + err.message)
      console.error(err);
    }
  })
}
