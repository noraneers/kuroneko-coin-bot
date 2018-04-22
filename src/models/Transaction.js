const mongoose = require("mongoose");
const arrayUniquePlugin = require('mongoose-unique-array');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  // _id: ObjectId, // comment out since this causes 'document must have an _id before saving' error.
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reciever: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    default: 0
  },
  senderId: {
    type: String,
    trim: true,
    sparse: true
  },
  recieverId: {
    type: String,
    trim: true,
    sparse: true
  },
  transactionHash: {
    type: String,
    default: null
  },
  message: {
    type: String,
    default: false
  },
  complete: {
    type: Boolean,
    default: false
  },
})

TransactionSchema.plugin(arrayUniquePlugin);

const Transaction = mongoose.model('Transaction', TransactionSchema);

class TransactionMethods{
  _filterParams(params){
    const columns = Object.keys(TransactionSchema.obj)
    const keys = Object.keys(params._doc || params)
    keys.forEach((key, index)=> {
      if(columns.indexOf(key) === -1){
        delete params[key];
      }
    });
    return params;
  }
  count(where={}){
    return new Promise((resolve, reject) => {
      Transaction.count(where, (err, transactions)=> {
        if(err) reject(err)
        else resolve(transactions)
      })
    })
  }
  find(where={}){
    return new Promise((resolve, reject) => {
      Transaction.find(where)
      .sort({_id: -1})
      .populate('sender')
      .populate('reciever')
      .exec((err, transactions)=> {
        // console.log('transactions', transactions);
        if(err) reject(err)
        else resolve(transactions)
      })
    })
  }
  findOne(where={}){
    return new Promise((resolve, reject) => {
      Transaction.findOne(where, (err, transaction)=> {
        if(err) reject(err)
        else resolve(transaction)
      })
    })
  }
  create(params){
    return new Promise((resolve, reject) => {
      Transaction.create(this._filterParams(params), (err, transaction)=> {
        if(err) reject(err)
        else resolve(transaction)
      })
    })
  }
  upsertOne(where, params){
    return new Promise((resolve, reject) => {
      Transaction.findOneAndUpdate(where, this._filterParams(params), {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }, (err, transaction)=> {
        if(err) reject(err)
        else resolve(transaction)
      })
    })
  }
}

module.exports = {
  Transaction: Transaction,
  TransactionSchema: TransactionSchema,
  TransactionMethods: new TransactionMethods()
};
