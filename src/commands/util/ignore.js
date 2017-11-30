const { Command } = require('discord-akairo')
const { stripIndents, getDBData } = require('../../util/Util.js')

const permCheck = {
  client: member => member.id === member.client.ownerID,
  guild: member => member.permissions.has('MANAGE_GUILD'),
  channel: member => member.permissions.has('MANAGE_CHANNLES'),
}

class IgnoreCommand extends Command {
  constructor() {
    super('ignore', {
      aliases: ['ignore', 'blacklist'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'member',
          type: 'member',
        },
        {
          id: 'scope',
          type: ['client', 'guild', 'channel'],
          default: 'guild',
        },
      ],
      description: stripIndents`
        Prevent a user from using commands.
        **Optional arguments:**
        \`scope\` - the scope in which to ignore the user (defaults to guild).

        **Usage:**
        \`ignore TeeSeal\` => ignores the user in the current guild.
        \`ignore TeeSeal channel\` => ignores the user in the current channel.
      `,
    })
  }

  exec(msg, args) {
    const { member, scope } = args
    if (!member) return msg.util.error('you need to specfy a member to ignore.')
    if (!permCheck[scope](msg.member)) {
      return msg.util.error('you do not have permission to ignore members in that scope.')
    }

    const [table, id] = getDBData(msg, scope)
    const db = this.client.db[table]
    const { blacklist } = db.get(id)

    if (blacklist.includes(member.id)) return msg.util.error(`**${member.displayName}** is already ignored in this ${scope}.`)

    blacklist.push(member.id)
    db.set(id, { blacklist })
    return msg.util.success(`**${member.displayName}** has been ignored in this ${scope}.`)
  }
}

module.exports = IgnoreCommand
