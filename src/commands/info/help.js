const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util')

class HelpCommand extends Command {
  constructor () {
    super('help', {
      aliases: ['help'],
      args: [
        {
          id: 'command',
          type: 'command'
        }
      ],
      description: 'Get help.'
    })
  }

  // TODO: Rewrite with MusenEmbed.
  exec (msg, args) {
    const { command } = args
    if (command) return msg.util.send(command.description)
    const channel = msg.channel.type === 'dm' ? msg.channel : msg.author

    const text = this.handler.categories
      .map(cat => {
        const filtered = cat.filter(cmd => !cmd.ownerOnly && cmd.enabled)
        if (filtered.size === 0) return null
        const list = filtered
          .map(cmd => {
            let string = `**${cmd.id}** | ${cmd.description.split('\n')[0]}`
            if (cmd.aliases.length > 1) {
              string += `\nAliases: ${cmd.aliases
                .slice(1)
                .map(a => `\`${a}\``)
                .join(', ')}`
            }
            return string
          })
          .join('\n\n')

        return `__**${cat.id}**__\n\n${list}`
      })
      .filter(cat => cat)
      .join('\n\n\n')

    if (msg.channel.type !== 'dm') msg.util.info('sent you a DM with info.')
    return channel.send(stripIndents`
      **Haku commands**:
      Use \`help <command>\` to view more detailed info on a command.

      ${text}
    `)
  }
}

module.exports = HelpCommand
