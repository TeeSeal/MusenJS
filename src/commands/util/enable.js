const { Command } = require('discord-akairo')
const { stripIndents, getDBData } = require('../../util/Util.js')

const permCheck = {
  client: member => member.id === member.client.ownerID,
  guild: member => member.permissions.has('MANAGE_GUILD'),
  channel: member => member.permissions.has('MANAGE_CHANNLES'),
}

class EnableCommand extends Command {
  constructor() {
    super('enable', {
      aliases: ['enable'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'toEnable',
          type(word) {
            if (word.startsWith('!')) {
              word = word.slice(1)
              const result = this.handler.categories.get(word)
              if (result) return result
            }

            const result = this.handler.findCommand(word)
            if (result) return result
            return this.handler.categories.get(word)
          },
        },
        {
          id: 'scope',
          type: ['globally', 'guild', 'channel'],
          default: 'guild',
        },
      ],
      description: stripIndents`
        Enable a disabled command.
        **Optional arguments:**
        \`scope\` - the scope in which to enable a command (defaults to guild).
        \`category\` - an entire command category to enable (will overwrite the command given).

        **Usage:**
        \`enable ping\` => enables the ping command in the guild.
        \`enable ping channel\` => enables the ping command in the channel.
        \`enable !music\` => enables all music commands in the guild.
      `,
    })
  }

  exec(msg, args) {
    const { toEnable, scope } = args
    if (!toEnable) return msg.util.error('you need to specfy a command to enable.')

    const [table, id, formattedScope] = getDBData(msg, scope)
    if (!permCheck[table](msg.member)) {
      return msg.util.error(`you do not have permission to enable commands ${formattedScope}.`)
    }

    const db = this.client.db[table]
    const { disabled } = db.get(id)
    let filtered

    if (toEnable instanceof Command) {
      if (!disabled.includes(toEnable.id)) return msg.util.error(`**${toEnable.id}** is not disabled ${formattedScope}.`)
      filtered = [toEnable.id]
    } else {
      filtered = toEnable.filter(c => disabled.includes(c.id)).map(c => c.id)
      if (filtered.size === 0) return msg.util.error(`all commands in **${toEnable.id}** are enabled.`)
    }

    for (const cmd of filtered) disabled.splice(disabled.indexOf(cmd.id), 1)

    db.set(id, { disabled })
    return msg.util.success(`**${toEnable.id}** has been enabled ${formattedScope}.`)
  }
}

module.exports = EnableCommand
