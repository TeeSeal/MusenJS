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
        },
        {
          id: 'provider',
          match: 'prefix',
          prefix: ['p=', 'provider='],
          type: 'lowercase',
        },
      ],
      description: 'Add a new station.',
    })
  }

  async exec(msg, args) {
    const { name, provider } = args
    const station = await this.client.radio.addStation(name, provider)
    return msg.util.success('success.', station.embed())
  }
}

module.exports = AddCommand
