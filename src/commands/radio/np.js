const { Command } = require('discord-akairo')

class ListCommand extends Command {
  constructor() {
    super('np', {
      aliases: ['np', 'nowplaying'],
      description: 'List ze stations',
    })
  }

  exec(msg) {
    const connection = this.client.radio.connections.get(msg.guild.id)
    if (!connection) return msg.util.error('nothing is currently playing.')
    return msg.util.send(connection.station.embed())
  }
}

module.exports = ListCommand
