const akairo = require('discord-akairo')
const logr = require('logr')
const keychain = require('../../keychain.json')
const config = require('../../config.json')

const SequelizeDatabase = require('../db/SequelizeDatabase.js')
const RadioHandler = require('./radio/RadioHandler.js')

class MusenClient extends akairo.AkairoClient {
  constructor(opts) {
    if (!opts.database) throw new Error('please specify a database.')
    super(opts)

    this.db = new SequelizeDatabase(opts.database)
    this.radio = null
  }

  async init() {
    logr.info('Connecting to database...')
    const db = await this.db.init()
    logr.success('OK')

    logr.info('Setting up providers...')
    this.radio = new RadioHandler(this, keychain, config)
    logr.success('OK')

    logr.info('Loading stations...')
    await this.radio.init(db.stations)
    logr.success('OK')

    logr.info('Logging in...')
    this.login(keychain.token)
  }
}

Object.assign(akairo.CommandUtil.prototype, {
  info(content, opts) {
    const name = this.message.member ? this.message.member.displayName : this.message.author.username
    return this.send(`**${name}** | ${content}`, opts)
  },

  success(content, opts) { return this.info(`✅ ${content}`, opts) },
  error(content, opts) { return this.info(`❌ ${content}`, opts) },
})

module.exports = MusenClient
