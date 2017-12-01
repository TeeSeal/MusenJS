const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info'],
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

    return msg.util.send(station.embed())
  }
}

module.exports = PlayCommand
