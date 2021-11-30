const { Command } = require('discord-akairo')
const { stripIndents, getDBData, canAdmin } = require('../../util')
const db = require('../../db')

const permCheck = {
  globally: member => member.id === member.client.ownerID,
  guild: canAdmin,
  channel: member => canAdmin(member) || member.permissions.has('MANAGE_CHANNLES')
}

class IgnoreCommand extends Command {
  constructor () {
    super('ignore', {
      aliases: ['ignore', 'blacklist'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'member',
          type: 'member'
        },
        {
          id: 'scope',
          type: ['globally', 'guild', 'channel'],
          default: 'guild'
        }
      ],
      description: stripIndents`
        Prevent a user from using commands.
        **Optional arguments:**
        \`scope\` - the scope in which to ignore the user (defaults to guild).

        **Usage:**
        \`ignore TeeSeal\` => ignores the user in the current guild.
        \`ignore TeeSeal channel\` => ignores the user in the current channel.
      `
    })
  }

  exec (msg, args) {
    const { member, scope } = args
    if (!member) return msg.util.error('you need to specfy a member to ignore.')

    const { modelName, formattedScope, id } = getDBData(msg, scope)
    if (!permCheck[scope](msg.member)) {
      return msg.util.error(
        `you do not have permission to enable commands ${formattedScope}.`
      )
    }

    const model = db[modelName]
    const blacklist =
      modelName === 'Setting'
        ? model.get('blacklist')
        : model.get(id, 'blacklist')

    if (blacklist.includes(member.id)) {
      return msg.util.error(
        `**${member.displayName}** is already ignored ${formattedScope}.`
      )
    }

    blacklist.push(member.id)

    if (modelName === 'Setting') {
      model.set('blacklist', blacklist)
    } else {
      model.set(id, { blacklist })
    }

    return msg.util.success(
      `**${member.displayName}** has been ignored ${formattedScope}.`
    )
  }
}

module.exports = IgnoreCommand
