const { Command } = require('discord-akairo')

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'hello'],
      description: 'Pong!'
    })
  }

  exec(msg) {
    return msg.util.info('Pong!').then(sent => {
      const timeDiff
        = (sent.editedAt || sent.createdAt) - (msg.editedAt || msg.createdAt)
      const text = `🔂\u2000**RTT**: ${timeDiff} ms\n💟\u2000**Heartbeat**: ${Math.round(
        this.client.ping
      )} ms`
      return msg.util.info(`Pong!\n${text}`)
    })
  }
}

module.exports = PingCommand
