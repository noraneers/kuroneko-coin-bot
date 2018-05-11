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

const notificationHandler = require(`${basePath}/src/handlers/notification`)

const defaultTimeout = 2500

describe.only('Notification Controller Tests:', () => {

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
    })
    notificationHandler(this.controller)
  })
  describe('@APP_NAME notification on or off', ()=>{
    beforeEach(async()=>{
      mongooseUtils.connect()

      this.slackUser = this.bot.api.getData('users.list');
      this.slackChannel = this.bot.api.getData('channels.list');

      generalUser.id = this.slackUser.members[1].id

      const users = await Promise.all([
         UserMethods.create(generalUser),
      ])
      this.user0 = users[0]


      this.slackIms = [{
        id: 'A0VHNJ7M1',
        user: this.user0.id,
        name: 'senderIm',
      }]
      this.bot.api.setData('im.list', {ims: this.slackIms});

      this.channel = this.slackChannel.channels[0].id
      this.txMessage = 'Thank you'
    })

    context('When turning it on,', ()=>{
      beforeEach(async()=>{
      })

      it('should return the reslut text', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `kuroneko notification on`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal(this.channel)
        message.text.should.equal('通知設定を `on` にしました。')
      }).timeout(defaultTimeout)

    })

    context('When turning it off,', ()=>{
      beforeEach(async()=>{
      })

      it('should return the reslut text', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `kuroneko notification off`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal(this.channel)
        message.text.should.equal('通知設定を `off` にしました。')
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