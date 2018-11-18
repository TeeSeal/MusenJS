const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

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

  exec (msg, args) {
    const { command } = args
    if (command) return msg.util.send(command.description)

    const pages = this.handler.categories.map(cat => {
      const commands = cat.filter(cmd => !cmd.ownerOnly)
      return `__**${cat.id}**__\n${commands.map(formatCommand).join('\n\n')}`
    })

    console.log(pages.length)
    return new Embed(msg.channel)
      .setTitle('Help')
      .setDescription(pages)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .send()
  }
}

function formatCommand (cmd) {
  let string = `**${cmd.id}** | ${cmd.description.split('\n')[0]}`

  if (cmd.aliases.length > 1) {
    const aliases = cmd.aliases.slice()
    aliases.splice(aliases.indexOf(cmd.id), 1)
    string += `\nAliases: ${aliases
      .map(a => `\`${a}\``)
      .join(', ')}`
  }

  return string
}

module.exports = HelpCommand
