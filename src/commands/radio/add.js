const { Command } = require('discord-akairo')

class AddCommand extends Command {
  constructor() {
    super('add', {
      aliases: ['add'],
      typing: true,
      ownerOnly: true,
      args: [
        {
          id: 'name',
          match: 'rest',
          type: 'lowercase',
        },
      ],
      description: 'Add ze station',
    })
  }

  async exec(msg, args) {
    const { name } = args
    const station = await this.client.radio.addStation(name)
    return msg.util.success(`Added station **${station.name}** on **${station.provider.name}**.`)
  }
}

module.exports = AddCommand
