const mongoose = require("mongoose");
const arrayUniquePlugin = require('mongoose-unique-array');
const { i18n, SLACK_ADMIN_USERNAME }  = require('../../config')
const { botApi } = require("../bot")

const Schema = mongoose.Schema;

const slackIdValidator = {
  validator: (id) => {
    return new Promise((resolve, reject) => {
      botApi.users.info({user: id}, (err, response) => {
        if(err) resolve(err)
        if(!response.user.is_bot){
          resolve(true)
        }else{
          resolve(false)
        }
      })
    })
  },
  message: 'the slack user is bot'
}

const UserSchema = new Schema({
  // _id: ObjectId, // comment out since this causes 'document must have an _id before saving' error.
  id: {
    type: String,
    required: [true, 'No ID'],
    trim: true,
    validate: slackIdValidator,
    index: {
      unique: true
    },
  },
  name: {
    type: String,
  },
  balance: {
    type: Number,
    default: 10000
  }
})

UserSchema.plugin(arrayUniquePlugin);

const User = mongoose.model('User', UserSchema);

class userMethods{
  _filterParams(params){
    const columns = Object.keys(UserSchema.obj)
    const keys = Object.keys(params._doc || params)
    keys.forEach((key, index)=> {
      if(columns.indexOf(key) === -1){
        delete params[key];
      }
    });
    return params;
  }
  find(where={}){
    return new Promise((resolve, reject) => {
      User.find(where, (err, users)=> {
        if(err) reject(err)
        else resolve(users)
      })
    })
  }
  findOne(where={}){
    return new Promise((resolve, reject) => {
      User.findOne(where, (err, user)=> {
        if(err) reject(err)
        else resolve(user)
      })
    })
  }
  findOneById(id){
    return new Promise((resolve, reject) => {
      User.findOne({id: id}, (err, user)=> {
        if(err) reject(err)
        else resolve(user)
      })
    })
  }
  create(params){
    return new Promise((resolve, reject) => {
      User.create(this._filterParams(params), (err, user)=> {
        if(err) reject(err)
        else resolve(user)
      })
    })
  }
  upsertOneById(id, params={}){
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate({id :id}, this._filterParams(params), {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }, (err, user)=> {
        if(err) reject(err)
        else resolve(user)
      })
    })
  }
  upsertOne(where, params){
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(where, this._filterParams(params), {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }, (err, user)=> {
        if(err) reject(err)
        else resolve(user)
      })
    })
  }
  getAdminUser(){
    return new Promise((resolve, reject) => {
      botApi.users.info({user: id}, (err, response) => {
        if(err) reject(err)
        else resolve(response.user)
      })
    })
  }
  getUserIdPattern(isSource){
    const exp = /<@([A-Z\d]+)>/ig
    return isSource? exp.source : exp;
  }
  getAmountPattern(){
    const exp = /([\d\.]*)/ig;
    return isSource? exp.source : exp;
  }
  formatUser(userId){
    return `<@${userId}>`
  }
  unformatUser(userId){
    return userId.replace((/(<@|>)/ig), '')
  }
}


module.exports = {
  User: User,
  UserSchema: UserSchema,
  UserMethods: new userMethods()
};
