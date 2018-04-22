const basePath = '..'

const mongoose = require("mongoose");
const { mongoUri } = require(`${basePath}/config`)
const { User } = require(`${basePath}/src/models/User`)

const seedUsers = [{
  id: 'U7MFUDH5W', // admin
  name: 'miyamoto',
  mainWallet: 0,
  walletAddresses: [
    '0x6a133982f6e43d5b0a7c22e89b45a101cd984756', // 10^18
    '0xBEB158BD90E69E8ff827D79938dAbC962a91F4cc', // 0
  ],
  balance: 3000
},{
  id: 'U7P080YER', // general user
  name: 'little.shotaro',
  mainWallet: 0,
  walletAddresses: [
    '0x5d339dB31c3B7C47a41550695A3acEcEaC9f926A', // 20000000000
  ],
  balance: 1000
},{
  id: 'U7PHURUF2', // nomoney
  name: 'Hironori Nakahara',
  mainWallet: 0,
  walletAddresses: [
    '0x053B42669536f2a98eb7Dd464e7D6e9a065428b2'
  ],
  balance: 0
},{
  id: 'U7N7DRNP6', // unregisted user
  name: 'Takahiro Nakamaruo',
  mainWallet: 0,
  // walletAddresses: [], // don't have wallet
}]

const mongooseUtils = {
  getSeedUser(type){
    switch(type) {
      case 'admin':
        return seedUsers[0]
        break;
      case 'general':
        return seedUsers[1]
        break;
      case 'nomoney':
        return seedUsers[2]
        break;
      case 'unregisted':
        return seedUsers[3]
        break;
    }
  },
  createSeedUser(type){
    return new Promise((resolve, reject) => {
      switch(type) {
        case 'admin':
          return User.create( seedUsers[0], (err, user)=>{
            if(err) reject(err)
            else resolve(user)
          })
          break;
        case 'general':
          return User.create( seedUsers[1], (err, user)=>{
            if(err) reject(err)
            else resolve(user)
          })
          break;
        case 'nomoney':
          return User.create( seedUsers[2], (err, user)=>{
            if(err) reject(err)
            else resolve(user)
          })
          break;
        case 'unregisted':
          return User.create( seedUsers[3], (err, user)=>{
            if(err) reject(err)
            else resolve(user)
          })
          break;
      }
    })

  },
  listenEvents(){
    mongoose.connection.on('error', function (err) {
      console.log(err);
    })
    mongoose.connection.on('open', function () {
      console.log('connected!!');
    })

    mongoose.connection.on( 'disconnected', function(){
        console.log( 'disconnected.' );
    });

    mongoose.connection.on( 'close', function(){
        console.log( 'connection closed.' );
    });
  },
  connect(){
    mongoose.connect(mongoUri + 'testDB', { useMongoClient: true }, (err) => {if (err) throw err})
  },
  dropAndClose(done){
    if(!mongoose.connection.db) done()
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  },
  disconnect(done){
    mongoose.disconnect(function () {
      done();
    });
  },
}

module.exports = {
  mongooseUtils: mongooseUtils,
  seedUsers: seedUsers
}