const { Command } = require('discord-akairo')
const { stripIndents, getDBData } = require('../../util')
const db = require('../../db')

const reserved = ['enable']
const permCheck = {
  globally: member => member.id === member.client.ownerID,
  guild: member => member.permissions.has('MANAGE_GUILD'),
  channel: member => member.permissions.has('MANAGE_CHANNLES'),
}

class DisableCommand extends Command {
  constructor() {
    super('disable', {
      aliases: ['disable'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'toDisable',
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
        Disable a command.
        **Optional arguments:**
        \`scope\` - the scope in which to disable a command (defaults to guild).
        \`category\` - an entire command category to disable (will overwrite the command given).

        **Usage:**
        \`disable ping\` => disables the ping command in the guild.
        \`disable ping channel\` => disables the ping command in the channel.
        \`disable !music\` => disables all music commands in the guild.
      `,
    })
  }

  exec(msg, args) {
    const { toDisable, scope } = args
    if (!toDisable) {
      return msg.util.error('you need to specfy a command/category to disable.')
    }
    if (toDisable instanceof Command && reserved.includes(toDisable.id)) {
      return msg.util.error(`you can't disable **${toDisable.id}**.`)
    }

    const { modelName, formattedScope, id } = getDBData(msg, scope)
    if (!permCheck[scope](msg.member)) {
      return msg.util.error(
        `you do not have permission to enable commands ${formattedScope}.`
      )
    }

    const model = db[modelName]
    const disabled
      = modelName === 'Setting'
        ? model.get('disabled')
        : model.get(id, 'disabled')

    let filtered
    if (toDisable instanceof Command) {
      if (disabled.includes(toDisable.id)) {
        return msg.util.error(
          `**${toDisable.id}** is already disabled ${formattedScope}.`
        )
      }
      filtered = [toDisable.id]
    } else {
      filtered = toDisable
        .filter(c => [disabled, reserved].every(arr => !arr.includes(c.id)))
        .map(c => c.id)
      if (filtered.size === 0) {
        return msg.util.error(
          `all commands in **${toDisable.id}** are already disabled.`
        )
      }
    }

    if (modelName === 'Setting') {
      model.set('disabled', disabled.concat(filtered))
    } else {
      model.set(id, { disabled: disabled.concat(filtered) })
    }

    return msg.util.success(
      `**${toDisable.id}** has been disabled ${formattedScope}.`
    )
  }
}

module.exports = DisableCommand
