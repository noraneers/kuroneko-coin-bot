const basePath = '../..'

// test tools
const Botmock = require('botkit-mock')
const chai = require('chai')
let expect = chai.expect;
let should = chai.should();
const { mongooseUtils } = require('../test_utils')

// required packages
const mongoose = require("mongoose");
const { User, UserMethods } = require(`${basePath}/src/models/User`)

const tipHandler = require(`${basePath}/src/handlers/tip`)

const defaultTimeout = 2500

describe('Tip Controller Tests:', () => {

  const adminUser = mongooseUtils.getSeedUser('admin')
  const generalUser = mongooseUtils.getSeedUser('general')

  beforeEach(async()=> {
    this.controller = Botmock({
      disable_startup_messages: true,
      debug: false,
      logger: {
        log: ()=>{}
      }
    })

    this.bot = this.controller.spawn({
      type: 'slack',
      afterProcessingUserMessageTimeout: 2300,
      // botExtender: (bot, botkit, config)=>{
      //   bot.say = function(message, text){
      //       bot.reply(message, 'Something new...' + text)
      //   }
      // }
    })
    tipHandler(this.controller)
  })
  describe('@gpbot tip [@revciver] [mount] [message]', ()=>{
    beforeEach(async()=>{
      mongooseUtils.connect()

      this.slackUser = this.bot.api.getData('users.list');
      this.slackChannel = this.bot.api.getData('channels.list');

      adminUser.id = this.slackUser.members[0].id
      generalUser.id = this.slackUser.members[1].id

      const users = await Promise.all([
         UserMethods.create(adminUser),
         UserMethods.create(generalUser),
      ])
      this.user0 = users[0]
      this.user1 = users[1]


      this.slackIms = [{
        id: 'A0VHNJ7M1',
        user: this.user0.id,
        name: 'senderIm',
      },{
        id: 'B0VHNJ7M2',
        user: this.user1.id,
        name: 'recieverIm',
      }]
      this.bot.api.setData('im.list', {ims: this.slackIms});

      this.channel = this.slackChannel.channels[0].id
      this.txMessage = 'Thank you'
    })

    context('When operating correctly,', ()=>{
      beforeEach(async()=>{
        this.amount = 100
      })

      it('should return the reslut text as last on the same channel', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `gpbot tip ${UserMethods.formatUser(this.user1.id)} ${this.amount} ${this.txMessage}`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal(this.channel)
        message.text.should.equal(`${UserMethods.formatUser(adminUser.id)} から ${UserMethods.formatUser(generalUser.id)} へ ${this.amount} ${process.env.COIN_UNIT}が送られました。`)
      }).timeout(defaultTimeout)

      it('should return the reslut text as last on the same channel', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `gpbot tip ${UserMethods.formatUser(this.user1.id)} ${this.amount} ${this.txMessage}`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal(this.channel)
        message.text.should.equal(`${UserMethods.formatUser(adminUser.id)} から ${UserMethods.formatUser(generalUser.id)} へ ${this.amount} ${process.env.COIN_UNIT}が送られました。`)
      }).timeout(defaultTimeout)
    })

    context('When the tip is higher then user\'s balance,', ()=>{
      beforeEach(async()=>{
        this.amount = 10000
      })

      it('should return the reslut for error', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `gpbot tip ${UserMethods.formatUser(this.user1.id)} ${this.amount} ${this.txMessage}`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal(this.channel)
        message.text.should.equal(`${process.env.COIN_UNIT}の送信が正常に行われませんでした。`)
      }).timeout(defaultTimeout)

    })

    afterEach(mongooseUtils.dropAndClose)
  })

  afterEach(() => {
    mongooseUtils.dropAndClose()
    this.controller.shutdown();
  })

  after(mongooseUtils.disconnect)
})