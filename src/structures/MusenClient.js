const akairo = require('discord-akairo')
const logr = require('logr')
const keychain = require('../../keychain.json')

const SequelizeDatabase = require('../db/SequelizeDatabase.js')

class MusenClient extends akairo.AkairoClient {
  constructor(options) {
    if (!options.database) throw new Error('please specify a database.')
    super(options)

    this.db = new SequelizeDatabase(options.database)
    this.inventories = null
    this.music = null
  }

  init() {
    logr.info('Connecting to database...')
    this.db.init().then(() => {
      logr.success('OK')

      logr.info('Logging in...')
      this.login(keychain.token)
    }).catch(err => { throw err })
  }
}

Object.assign(akairo.CommandUtil.prototype, {
  info(content, options) {
    const name = this.message.member ? this.message.member.displayName : this.message.author.username
    return this.send(`**${name}** | ${content}`, options)
  },

  success(content, options) { return this.info(`✅ ${content}`, options) },
  error(content, options) { return this.info(`❌ ${content}`, options) },
})

module.exports = MusenClient
