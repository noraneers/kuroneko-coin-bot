const fs = require('fs')
const path = require('path')
const util = require('util');

const debug = require('debug')

const { User, UserMethods } = require('../models/User')
const { Emoji, EmojiMethods } = require('../models/Emoji')

const SmartPay = require('../smartpay')
const botUtil = require('./botUtil')


// When reaction added. Emoji list is written on /src/models/Emoji.js
module.exports = (controller) => {
  controller.on(['reaction_added'], (bot, message) => {
    const emojiKey = message.reaction;
    if( !Object.keys(Emoji).some((key) => key === emojiKey) ) return

    const senderId = message.user;
    const recieverId = message.item_user;
    const amount = EmojiMethods.getAmount(emojiKey) || 1

    const smartpay = new SmartPay(senderId, recieverId, amount, `reaction:${emojiKey}-${message.text}`)
    smartpay.payOffChain().then((result)=>{
      const [sender, reciever] = result.users;
      //TODO: Write test for reply on other channel
      botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amount, sender, `${UserMethods.formatUser(sender.id)} が ${EmojiMethods.formatEmoji(emojiKey)} をつけました！`)
      botUtil.replySuccessTxOnBotChannel(bot, message, sender.id, reciever.id, amount, reciever, `${UserMethods.formatUser(sender.id)} が ${EmojiMethods.formatEmoji(emojiKey)} をつけました！`)
    }).catch(async (err)=> {
      const sender = await UserMethods.findOneById(senderId)
      botUtil.replyOnBotChannel(bot, message, err.message, sender)
    })
  })
}
