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

const reactionHandler = require(`${basePath}/src/handlers/reaction`)

const defaultTimeout = 2500

describe.skip('TODO: HOW TO TEST FOR BOT REACTION Reaction Controller Tests:', () => {

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
      afterProcessingUserMessageTimeout: 300,
    })
    reactionHandler(this.controller)
  })
  describe('reactions.add', ()=>{
    context('When operating correctly', ()=>{

      beforeEach(async()=>{
        mongooseUtils.connect()
        const users = await Promise.all([
           UserMethods.create(adminUser),
           UserMethods.create(generalUser),
        ])
        this.user0 = users[0]
        this.user1 = users[1]

        this.emoji = '+1'
        this.channel = 'someChannel'
      })

      it('should return the ok is true', async() => {
        this.bot.api.callAPI('reactions.add', {}, (err, data) => {
          data.ok.should.be.true
        })
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })

    afterEach(() => {
      mongooseUtils.dropAndClose()
      this.controller.shutdown();
    })
  })


  after(mongooseUtils.disconnect)
})