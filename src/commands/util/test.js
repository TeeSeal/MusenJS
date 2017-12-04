const { Command } = require('discord-akairo')

class TestCommand extends Command {
  constructor() {
    super('test', {
      aliases: ['test'],
      ownerOnly: true,
      description: 'test.',
      split: 'sticky',
      args: [
        {
          id: 'a',
          type: 'commandCategory',
        },
        {
          id: 'flag',
          match: 'flag',
          prefix: '-flag',
        },
        {
          id: 'prefix',
          match: 'prefix',
          prefix: 'prefix=',
        },
      ],
    })
  }

  async exec(msg) {
    const connection = await msg.member.voiceChannel.join()
    connection.playArbitraryInput('async:https://listen.moe/stream')
  }
}

module.exports = TestCommand
