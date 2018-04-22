const Emoji = {
  'bow': 1 ,
  '+1': 1 ,
  'smile': 1 ,
  'arigato': 3 ,
  'kissing_heart': 3 ,
  'confetti_ball': 5 ,
  'kami': 5 ,
  'tada': 5 ,
  'congratulations': 10 ,
  '100': 100,
}

class EmojiMethods {
  getAmount(label){
    return Emoji[label]
  }

  getLabelAndCoin(label){
    return [this.formatEmoji(label),'|', Emoji[label], process.env.COIN_UNIT].join(' ')
  }

  formatEmoji(label){
    return ':' + label + ':'
  }
}

module.exports = {
  Emoji: Emoji,
  EmojiMethods: new EmojiMethods()
};
