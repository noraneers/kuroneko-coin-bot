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

const balanceHandler = require(`${basePath}/src/handlers/balance`)

const defaultTimeout = 2500

describe('Balance Controller Tests:', () => {

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
    balanceHandler(this.controller)
  })

  describe('@gpbot balance', ()=>{
    context('When operating correctly', ()=>{

      beforeEach(async()=>{
        mongooseUtils.connect()
        this.user0 = await UserMethods.create(generalUser)
      })

      it('should return deposited balanace', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance`, isAssertion: true
              }
            ]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`${generalUser.balance} ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      it('should return on the same channel', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance`, isAssertion: true
              }
            ]
          }
        ])
        message.channel.should.equal('someChannel')
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })
  describe('@gpbot balance [@user]', ()=>{
    context('When [@user] is correct user format', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        const users = await Promise.all([
           UserMethods.create(adminUser),
           UserMethods.create(generalUser),
        ])
        this.user0 = users[0]
        this.user1 = users[1]
      })

      it('should return deposit balanace by @user', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance ${UserMethods.formatUser(generalUser.id)}`, isAssertion: true
              }
            ]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`${generalUser.balance} ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
    context('When [@user] is incorrect user format', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        const users = await Promise.all([
           UserMethods.create(adminUser),
           UserMethods.create(generalUser),
        ])
        this.user0 = users[0]
        this.user1 = users[1]
      })

      it('shouldn\'t respond', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance ${generalUser.id}`, isAssertion: true
              }
            ]
          }
        ])
        message.should.not.have.any.property()
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  describe('@gpbot balance [option]', ()=>{
    context('When the option is \"deposit\"', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        this.user0 = await UserMethods.create(generalUser)
      })

      it('should return deposit balanace', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [{
              text: `balance deposit`, isAssertion: true
            }]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`${generalUser.balance} ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
    context('When the option is \"wallet\"', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        this.user0 = await UserMethods.create(generalUser)
      })

      it('should return wallet balanace', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [{
              text: `balance wallet`, isAssertion: true
            }]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`20000000000 ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })

    context('When the option is \"all\"', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        this.user0 = await UserMethods.create(generalUser)
      })

      it('should return wallet and deposit balanace', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance all`, isAssertion: true
              }
            ]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`20000001000 ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      it('should not respond if the option is \"invaild\"', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance invaild`, isAssertion: true
              }
            ]
          }
        ])
        message.should.not.have.any.property()
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  describe('@gpbot balance [@user] [option]', ()=>{
    context('When [@user] is correct and [option] is all', ()=>{
      beforeEach(async()=>{
        mongooseUtils.connect()
        const users = await Promise.all([
           UserMethods.create(adminUser),
           UserMethods.create(generalUser),
        ])
        this.user0 = users[0]
        this.user1 = users[1]
      })

      it('should return wallet and deposit balanace', async() => {
        const message = await this.bot.usersInput([
          {
            user: this.user0.id,
            channel: 'someChannel',
            messages: [
              {
                text: `balance ${UserMethods.formatUser(generalUser.id)} all`, isAssertion: true
              }
            ]
          }
        ])
        message.text.should.equal(`Balance of ${UserMethods.formatUser(generalUser.id)}： \`20000001000 ${process.env.COIN_UNIT}\``)
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  afterEach(() => {
    mongooseUtils.dropAndClose()
    this.controller.shutdown();
  })

  after(mongooseUtils.disconnect)
})