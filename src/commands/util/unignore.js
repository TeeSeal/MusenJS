const { Command } = require('discord-akairo')
const { stripIndents, getDBData } = require('../../util')
const db = require('../../db')

const permCheck = {
  globally: member => member.id === member.client.ownerID,
  guild: member => member.permissions.has('MANAGE_GUILD'),
  channel: member => member.permissions.has('MANAGE_CHANNLES')
}

class UnignoreCommand extends Command {
  constructor() {
    super('unignore', {
      aliases: ['unignore', 'whitelist'],
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
        Unignore an ignored user.
        **Optional arguments:** \`scope\`
        \`scope\` - the scope in which to unignore the user (defaults to guild).

        **Usage:**
        \`unignore TeeSeal\` => unignores the user in the current guild.
        \`unignore TeeSeal channel\` => unignores the user in the current channel.
      `
    })
  }

  exec(msg, args) {
    const { member, scope } = args
    if (!member) {
      return msg.util.error('you need to specfy a member to unignore.')
    }

    const { modelName, formattedScope, id } = getDBData(msg, scope)
    if (!permCheck[scope](msg.member)) {
      return msg.util.error(
        `you do not have permission to enable commands ${formattedScope}.`
      )
    }

    const model = db[modelName]
    const blacklist
      = modelName === 'Setting'
        ? model.get('blacklist')
        : model.get(id, 'blacklist')

    if (!blacklist.includes(member.id)) {
      return msg.util.error(
        `**${member.displayName}** is not ignored in this ${scope}.`
      )
    }

    blacklist.splice(blacklist.indexOf(member.id), 1)

    if (modelName === 'Setting') {
      model.set('blacklist', blacklist)
    } else {
      model.set(id, { blacklist })
    }

    return msg.util.success(
      `**${member.displayName}** has been unignored in this ${scope}.`
    )
  }
}

module.exports = UnignoreCommand
