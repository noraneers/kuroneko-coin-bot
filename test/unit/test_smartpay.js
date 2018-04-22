const basePath = '../..'

// test tools
const Botmock = require('botkit-mock')
const chai = require('chai')
let expect = chai.expect;
let should = chai.should();
const { mongooseUtils } = require(`../test_utils`)
const SakanaCoin = require(`${basePath}/src/coin`)

// required packages
const mongoose = require("mongoose");
const { User, UserMethods } = require(`${basePath}/src/models/User`)

const SmartPay = require(`${basePath}/src/smartpay`)

const defaultTimeout = 1000000

describe('SmartPay Tests:', () => {

  const adminUser = mongooseUtils.getSeedUser('admin')
  const generalUser = mongooseUtils.getSeedUser('general')

  describe('#payOffChain() :', ()=>{
    beforeEach(async()=>{
      mongooseUtils.connect()
      const users = await Promise.all([
         UserMethods.create(adminUser),
         UserMethods.create(generalUser),
      ])
      this.user0 = users[0]
      this.user1 = users[1]

      this.amount = 10
      this.channel = 'someChannel'
    })
    context('When operating correctly', ()=>{
      it('should return the sender\'s balance redueced by the amount', async() => {
        const smartpay = new SmartPay(this.user0.id, this.user1.id, this.amount)
        const result = await smartpay.payOffChain()
        const [sender, reciever] = result.users;
        sender.balance.should.equal( adminUser.balance - this.amount )
      }).timeout(defaultTimeout)

      it('should return the reciever\'s balance added by the amount', async() => {
        const smartpay = new SmartPay(this.user0.id, this.user1.id, this.amount)
        const result = await smartpay.payOffChain()
        const [sender, reciever] = result.users;
        reciever.balance.should.equal( generalUser.balance + this.amount )
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  describe('#payOnChain() :', ()=>{
    // context('When the amount is smaller than user\'s balance', ()=>{
    beforeEach(async()=>{
      mongooseUtils.connect()
      const users = await Promise.all([
         UserMethods.create(generalUser),
      ])
      this.user0 = users[0]

      this.amount = 20
      this.channel = 'someChannel'
    })
    context('When the user send 10 coin to the same user\'s wallet', ()=>{

      it('should return the sender\'s balance redueced by the amount', async() => {
        const smartpay = new SmartPay(this.user0.id, this.user0.id, this.amount)
        const result = await smartpay.payOnChain()
        const [sender, reciever] = result.users;
        sender.balance.should.equal( generalUser.balance - this.amount )
      }).timeout(defaultTimeout)

      it.only('should return the user\'s wallet balance added by the amount', async() => {
        const smartpay = new SmartPay(this.user0.id, this.user0.id, this.amount)
        const beforeBal = await SakanaCoin.methods.balanceOf(this.user0.walletAddresses[0]).call()
        const result = await smartpay.payOnChain()
        const [sender, reciever] = result.users;
        const afterBal = await SakanaCoin.methods.balanceOf(this.user0.walletAddresses[0]).call()
        UserMethods.getCoinByWei(afterBal).should.equal( UserMethods.getCoinByWei(beforeBal) + this.amount )
      }).timeout(defaultTimeout)

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  afterEach(() => {
    mongooseUtils.dropAndClose()
  })

  after(mongooseUtils.disconnect)
})