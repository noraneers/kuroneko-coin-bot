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

describe('UserModel Tests:', () => {

  const generalUser = mongooseUtils.getSeedUser('general')

  describe('#create() :', ()=>{
    context('When general user is created and the user does "not" exist,', ()=>{
      beforeEach(mongooseUtils.connect)

      it('should create without error', async () => {
        const user = await UserMethods.create(generalUser)
        return user
      })

      it('should have a property id', async () => {
         const user = await UserMethods.create(generalUser)
         user.should.have.a.property( 'id' );
      })

      it('should equal userId', async() => {
        const user = await UserMethods.create(generalUser)
        user.id.should.equal( generalUser.id );
      })

      afterEach(mongooseUtils.dropAndClose)
    })
  })

  // describe('#save() :', ()=>{
  //   context('When the argument is a user instance,', ()=>{
  //     beforeEach(async()=>{
  //       mongooseUtils.connect()
  //       this.user0 = await mongooseUtils.createSeedUser('general')
  //     })

  //     it('should return updated user', async () => {
  //       this.user0.balance = 10000
  //       const user = await this.user0.save()
  //       user.balance.should.equal(10000)
  //     })

  //     it('should save the user on the database', async () => {
  //       this.user0.balance = 10000
  //       const user = await this.user0.save(this.user0)
  //       const updatedUser = await UserMethods.findOne({id: user.id})
  //       updatedUser.balance.should.equal(10000)
  //     })

  //     afterEach(mongooseUtils.dropAndClose)
  //   })
  // })

  describe('#upsert() :', ()=>{
    context('When general user is created and the user does "not" exist,', ()=>{

      beforeEach(mongooseUtils.connect)

      it('should create without error', async () => {
        await UserMethods.upsertOne(generalUser, generalUser)
      })

      it('should create the user who has a property id', async () => {
         const user = await UserMethods.upsertOne(generalUser, generalUser)
         user.should.have.a.property( 'id' );
      })

      it('should create user_id that equal inputed userId', async() => {
        const user = await UserMethods.upsertOne(generalUser, generalUser)
        user.id.should.equal( generalUser.id );
      })

      it('should create user\'s balance that equal inputed balance', async() => {
        const user = await UserMethods.upsertOne(generalUser, generalUser)
        user.balance.should.equal( generalUser.balance );
      })

      it('should create 1000 balance as default even if the user has no balance', async() => {
        const user = await UserMethods.upsertOne(generalUser, generalUser)
        user.balance.should.equal( 1000 );
      })

      afterEach(mongooseUtils.dropAndClose)
    })

    context('When general user is created when the user exists,', ()=>{

      beforeEach(async ()=> {
        mongooseUtils.connect()
        this.user0 = await mongooseUtils.createSeedUser('general')
      });

      it('should update without error', async() => {
        const user1 = await UserMethods.upsertOne(generalUser, generalUser)
      })

      it('should create the user who has a property id', async () => {
         const user1 = await UserMethods.upsertOne(generalUser, generalUser)
         user1.should.have.a.property( 'id' );
      })

      it('should create user\'s balance that equal inputed balance', async() => {
        const user1 = await UserMethods.upsertOne(generalUser, generalUser)
        user1.id.should.equal( generalUser.id );
      })

      it('should create 1000 balance as default even if the user has no balance', async() => {
        const user1 = await UserMethods.upsertOne(generalUser, generalUser)
        user1.balance.should.equal( 1000 );
      })

      it('responds with matching a length of user records ', async() => {
        const user1 = await UserMethods.upsertOneById(this.user0.id, this.user0)
        const users = await UserMethods.find()
        users.should.have.length(1);
      })

      it('responds with matching a length of user records ', async() => {
        const user1 = await UserMethods.upsertOne(generalUser, generalUser)
        const users = await UserMethods.find()
        users.should.have.length(1);
      })

      afterEach(mongooseUtils.dropAndClose)

    })
  })

  after(mongooseUtils.disconnect)
})


