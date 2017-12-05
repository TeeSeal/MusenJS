const { Command } = require('discord-akairo')

class InfoCommand extends Command {
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
      description: 'Get information about a station.',
    })
  }

  exec(msg, args) {
    const { name } = args
    if (!name) return msg.util.error('gotta name a station.')
    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')

    return msg.util.send(station.embed())
  }
}

module.exports = InfoCommand
