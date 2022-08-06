const { sequelize, Guild } = require('../db')
const { ownerID, lavalink } = require('../config')
const logr = require('logr')
const MusicManager = require('./music')
const {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler
} = require('discord-akairo')

class MusenClient extends AkairoClient {
  constructor () {
    super({ ownerID, allowMention: true, handleEdits: true })

    this.commandHandler = new CommandHandler(this, {
      prefix: msg => Guild.get(msg.guild ? msg.guild.id : 'dm', 'prefix'),
      commandUtil: true,
      handleEdits: true,
      automateCategories: true,
      directory: 'src/commands/'
    })

    this.listenerHandler = new ListenerHandler(this, {
      directory: 'src/listeners/',
      automateCategories: true
    })

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: 'src/inhibitors/',
      automateCategories: true
    })

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    })

    this.commandHandler.useListenerHandler(this.listenerHandler)
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler)

    this.commandHandler.loadAll()
    this.inhibitorHandler.loadAll()
    this.listenerHandler.loadAll()

    this.music = new MusicManager(this, lavalink)
  }

  async init () {
    logr.info('Connecting to database...')
    await sequelize.sync()
    logr.success('OK')

    logr.info('Logging in...')
    this.login(process.env.TOKEN)
  }

  async logError (error) {
    logr.error(error)

    if (!this.readyTimestamp) throw error

    const owner = await this.users.fetch(this.options.ownerID)
    if (!owner) return

    owner.send(`Got an error:\n\`\`\`${error.stack}\`\`\``)
  }
}

module.exports = MusenClient
