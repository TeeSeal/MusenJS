const { Command } = require('discord-akairo')

class DeleteCommand extends Command {
  constructor() {
    super('delete', {
      aliases: ['delete'],
      ownerOnly: true,
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

  exec(msg, args) {
    const { name } = args
    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')

    station.delete()
    return msg.util.success(`deleted **${station.displayName}** from **${station.provider.name}**.`)
  }
}

module.exports = DeleteCommand
