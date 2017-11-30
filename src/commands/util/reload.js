const { Command } = require('discord-akairo')

class ReloadCommand extends Command {
  constructor() {
    super('reload', {
      aliases: ['reload', 'rld'],
      description: 'Reload a command.',
      ownderOnly: true,
      args: [
        {
          id: 'command',
          type: 'command',
        },
      ],
    })
  }

  exec(msg, args) {
    const { command } = args
    if (!command) return msg.util.error('couldn\'t find command.')
    command.reload()
    return msg.util.success(`reoladed **${command.id}**.`)
  }
}

module.exports = ReloadCommand
