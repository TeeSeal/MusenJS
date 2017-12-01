const { Command } = require('discord-akairo')

class StopCommand extends Command {
  constructor() {
    super('stop', {
      aliases: ['stop'],
      description: 'Stop ze pleyback',
    })
  }

  exec(msg) {
    const connection = this.client.radio.connections.get(msg.guild.id)
    if (!connection) return msg.util.error('no active conneciton in this guild.')
    connection.stop()
    return msg.util.success('stopped playback')
  }
}

module.exports = StopCommand
