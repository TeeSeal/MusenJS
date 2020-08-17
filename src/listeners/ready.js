const { Listener } = require('discord-akairo')
const logr = require('logr')

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  async exec () {
    logr.success('OK')
    logr.info('Initializing Lavalink...')
    await this.client.music.init()
    logr.success(`All systems online! Logged in as ${this.client.user.tag}.`)
  }
}

module.exports = ReadyListener
