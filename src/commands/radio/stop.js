const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play', 'join', 'change', 'switch'],
      description: 'Pley ze station',
    })
  }

  async exec(msg, args) {
    const connection = this.client.radio.connections.get(msg.guild.id)
    if (!connection) return msg.util.error('no active conneciton in this guild.')
    connection.stop()
    return msg.util.success('stopped playback')
  }
}

module.exports = PlayCommand
