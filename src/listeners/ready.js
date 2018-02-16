const { Listener } = require('discord-akairo')
const logr = require('logr')

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  exec() {
    logr.success(`All systems online! Logged in as ${this.client.user.tag}.`)
  }
}

module.exports = ReadyListener
