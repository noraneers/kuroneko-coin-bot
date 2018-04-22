const fs = require('fs')
const path = require('path')
const util = require('util');

const debug = require('debug')

const { User, UserSchema, UserMethods } = require('../models/User')


module.exports = (controller, botUtil) => {
  const echoUserInfo = (convo, user)=>{
    const username = UserMethods.formatUser(user.id)
    convo.say({
      ephemeral: true,
      text: __('members.amount', username, user.balance, process.env.COIN_UNIT)
    })
  }

  controller.hears(`member$`, ["direct_mention", "direct_message"], (bot, message) => {
    bot.startConversation(message, (err, convo)=> {
      if (err) {
        throw err
      }
      User.find({} , Object.keys(UserSchema.obj), {sort: {'balance': -1}}, (err, users) => {
        if (err) {
          throw err
        }
        if (users.length > 0) {
          for (let i = 0; i < users.length; i++) {
            echoUserInfo(convo, users[i])
          }
        }else{
          convo.say({
            ephemeral: true,
            text: __('members.nobody')
          })
        }
      })
    })
  })

  const userIdPattern = /<@([A-Z\d]+)>/ig;
  const amountPattern = /([\d\.]*)/ig;

  controller.hears(`member ${userIdPattern.source}`, ["direct_mention", "direct_message"], (bot, message) => {
    const user = message.match[1];

    bot.startConversation(message, (err, convo)=> {
      if (err) {
        throw err
      }
      User.find({} , Object.keys(UserSchema.obj), {sort: {'id': 1}}, (err, users) => {
        if (err) {
          throw err
        }
        for (let i = 0; i < users.length; i++) {
          if(user == users[i].id){
            echoUserInfo(convo, users[i])
          }
        }
      })
    })
  })
}