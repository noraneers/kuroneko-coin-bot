'use strict'
const network = process.env.NETWORK || 'ropsten'

const mongoBaseUri = (process.env.MONGO_URI )? `mongodb://${process.env.MONGO_URI}:27017/` : `mongodb://localhost:27017/`
const mongoUri = process.env.MONGODB_URI || mongoBaseUri + network

const SLACK_TOKEN = process.env.DEVELOP_SLACK_TOKEN || process.env.SLACK_TOKEN

const SLACK_DEBUG = (process.env.NODE_ENV === 'development')? true : false

const lang = process.env.MESSAGE_LANG || 'ja'

const i18n = require('i18n')

i18n.configure({
    locales: ['ja'],
    defaultLocale: lang,
    directory: './locales',
    register: global,
    objectNotation: true
})
i18n.setLocale(lang)

module.exports = {
  MONGO_BASE_URI: mongoBaseUri,
  MONGO_URI: mongoUri,
  BOT_CONFIG: {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    scopes: ['bot']
  },
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  SLACK_ADMIN_USERNAME: process.env.SLACK_ADMIN_USERNAME,
  SLACK_TOKEN: SLACK_TOKEN,
  SLACK_DEBUG: SLACK_DEBUG,
  APP_NAME: process.env.APP_NAME || "@APP_NAME",
  I18N: i18n,
}
