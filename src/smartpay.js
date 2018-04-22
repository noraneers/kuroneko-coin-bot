'use strict'

const debug = require('debug')

const util = require('util')
const { EventEmitter } = require('events')

const { User, UserMethods } = require('./models/User')
const { Transaction, TransactionMethods } = require('./models/Transaction')

let CURRENT_PROCESS_TRANSACTIONS = [];

class SmartPay{
  constructor (senderId, recieverId, amount, message) {
    this.senderId = senderId;
    this.recieverId = recieverId;
    this.amount = amount;
    this.message = message || '';
    this.isDone = false
  }

  async _setTransaction () {
    this.transaction = await TransactionMethods.create({
      amount: this.amount,
      senderId: this.senderId,
      recieverId: this.recieverId,
      message: this.message,
      transactionHash: null
    })
    CURRENT_PROCESS_TRANSACTIONS.push(this.transaction._id)
  }

  _clearTransaction () {
    CURRENT_PROCESS_TRANSACTIONS.some((id, i)=>{
      if (id == this.transaction._id) CURRENT_PROCESS_TRANSACTIONS.splice(i, 1);
    });
  }

  async _setSenderAndreciever(){
    const users = await Promise.all([
      UserMethods.upsertOneById(this.senderId),
      UserMethods.upsertOneById(this.recieverId),
    ])
    this.sender = users[0];
    this.reciever = users[1];
    return users
  }

  _waitTransaction () {
    return new Promise((resolve, reject) => {
      const t = setInterval(()=>{
        if(CURRENT_PROCESS_TRANSACTIONS[0] == this.transaction._id){
          clearInterval(t)
          resolve()
        }
      }, 50)

      setTimeout(()=>{
        clearInterval(t)
        resolve()
      }, 30 * 1000 + 50 * CURRENT_PROCESS_TRANSACTIONS.length)
    });
  }

  async _updateSenderAndreciever (complete=false, transactionHash=null) {
    const params = {
      sender: this.sender._id,
      reciever: this.reciever._id,
      complete: complete
    }
    if(transactionHash){
      params['transactionHash'] = transactionHash;
    }
    return Promise.all([
      Promise.all([
        UserMethods.upsertOneById(this.sender.id, this.sender),
        UserMethods.upsertOneById(this.reciever.id, this.reciever)
      ]),
      TransactionMethods.upsertOne({_id: this.transaction._id}, params),
    ])
  }

  async payOffChain () {
    if(this.isDone) return

    await this._setTransaction()

    await this._waitTransaction()

    if(typeof this.amount !== 'number'){
      this._clearTransaction()
      throw new Error(__('transaction.errors.notNumber'));
    }

    await this._setSenderAndreciever()

    if(this.sender.id === this.reciever.id){
      this._clearTransaction()
      throw new Error(__('transaction.errors.myself'));
    }

    this.sender.balance   = this.sender.balance   - this.amount
    this.reciever.balance = this.reciever.balance + this.amount

    if(this.sender.balance < 0){
      this._clearTransaction()
      throw new Error(__('transaction.errors.shortage'));
    }

    const result = await this._updateSenderAndreciever(true)

    this._clearTransaction()
    this.isDone = true
    return {
      users: result[0],
      transaction: result[1],
    };
  }
}

module.exports = SmartPay
