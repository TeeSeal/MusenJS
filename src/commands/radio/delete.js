const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('delete', {
      aliases: ['delete'],
      args: [
        {
          id: 'name',
          match: 'rest',
          type: 'lowercase',
        },
      ],
      description: 'Delete ze station',
    })
  }

  async exec(msg, args) {
    const { name } = args
    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')

    station.delete()
    return msg.util.success('station successfully deleted.')
  }
}

module.exports = PlayCommand
