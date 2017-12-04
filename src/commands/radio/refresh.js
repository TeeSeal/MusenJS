const { Command } = require('discord-akairo')

class RefreshCommand extends Command {
  constructor() {
    super('refresh', {
      aliases: ['refresh'],
      typing: true,
      args: [
        {
          id: 'name',
          match: 'rest',
          type: 'lowercase',
        },
      ],
      description: 'Refresh a station.',
    })
  }

  async exec(msg, args) {
    const { name } = args
    if (!name) {
      if (!this.client.radio.connections.has(msg.guild.id)) return msg.util.error('gotta give it a name')
      const connection = await this.client.radio.connections.get(msg.guild.id).reset()
      return msg.util.success(`refreshed **${connection.station.name}**.`, connection.station.embed())
    }

    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')

    await station.refresh()
    return msg.util.success(`refreshed **${station.name}**.`, station.embed())
  }
}

module.exports = RefreshCommand
