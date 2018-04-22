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
const { i18n } = require(`${basePath}/config`)

const rainHandler = require(`${basePath}/src/handlers/rain`)

const defaultTimeout = 2500

describe('Rain Controller Tests:', () => {
  const adminUser = mongooseUtils.getSeedUser('admin')
  const generalUser = mongooseUtils.getSeedUser('general')
  const nomoneyUser = mongooseUtils.getSeedUser('nomoney')
  const unregistedUser = mongooseUtils.getSeedUser('unregisted')

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
    rainHandler(this.controller)
  })
  describe('@gpbot rain', ()=>{
    beforeEach(async()=>{
      mongooseUtils.connect()

      this.slackUser = this.bot.api.getData('users.list');
      this.slackChannel = this.bot.api.getData('channels.list');
      adminUser.id = this.slackUser.members[0].id
      generalUser.id = this.slackUser.members[1].id
      nomoneyUser.id = this.slackUser.members[2].id
      unregistedUser.id = this.slackUser.members[3].id

      const users = await Promise.all([
         UserMethods.create(adminUser),
         UserMethods.create(generalUser),
         UserMethods.create(nomoneyUser),
         UserMethods.create(unregistedUser),
      ])
      this.user0 = users[0]
      this.user1 = users[1]
      this.user2 = users[2]
      this.user3 = users[3]

      this.slackIms = [{
        id: 'A0VHNJ7M1',
        user: this.user0.id,
        name: 'senderIm',
      },{
        id: 'B0VHNJ7M2',
        user: this.user1.id,
        name: 'recieverIm',
      }]
      this.bot.api.setData('channels.list', this.slackChannel);

      this.slackChannel.channels = this.slackChannel.channels.map((channel)=>{
        channel.members = [
          this.user0.id,
          this.user1.id,
          this.user2.id,
          this.user3.id,
        ]
        return channel
      })
      this.bot.api.setData('im.list', {ims: this.slackIms});

      this.channel = this.slackChannel.channels[0].id
      this.txMessage = 'Thank you'
    })

    context('When operating correctly,', ()=>{
      beforeEach(async()=>{
        this.amount = 300
      })

      it('should return the reslut text as last on the same channel', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: this.channel,
            messages: [
              {
                text: `gpbot rain ${this.amount} ${this.txMessage}`, isAssertion: true
              }
            ]
          }
        ])
        const [user0, user1, user2, user3] = await Promise.all([
          UserMethods.findOneById(this.user0.id),
          UserMethods.findOneById(this.user1.id),
          UserMethods.findOneById(this.user2.id),
          UserMethods.findOneById(this.user3.id),
        ])
        user0.balance.should.equal(this.user0.balance - this.amount)
        user1.balance.should.equal(this.user1.balance + this.amount/3)
        user2.balance.should.equal(this.user2.balance + this.amount/3)
        user3.balance.should.equal(this.user3.balance + this.amount/3)
      }).timeout(defaultTimeout)
    })
  })

  afterEach(() => {
    mongooseUtils.dropAndClose()
    this.controller.shutdown();
  })

  after(mongooseUtils.disconnect)
})