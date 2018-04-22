'use strict'
const mongoose = require("mongoose");
const User = require('./models/User')
const {MONGO_URI}  = require('../config')

mongoose.Promise = global.Promise

mongoose.connect(MONGO_URI, {
  useMongoClient: true,
  autoReconnect: true
})
.then((db) => {return db.once('openUri', () => {
  console.log("db is open!")
})})
.catch((err) => {throw err})

mongoose.connection.on( 'connected', function(){
    console.log('connected.');
});

mongoose.connection.on( 'error', function(err){
    console.log( 'failed to connect a mongo db : ' + err );
});

// mongoose.disconnect() を実行すると、disconnected => close の順番でコールされる
mongoose.connection.on( 'disconnected', function(){
    console.log( 'disconnected.' );
});

mongoose.connection.on( 'close', function(){
    console.log( 'connection closed.' );
});

module.exports = {
  mongoose: mongoose,
}