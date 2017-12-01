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
      description: 'Refresh ze station',
    })
  }

  async exec(msg, args) {
    const { name } = args
    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')

    const newStation = await station.refresh()
    return msg.util.success(`refreshed **${newStation.displayName}**.`, newStation.embed())
  }
}

module.exports = RefreshCommand
