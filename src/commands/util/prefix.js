const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util/Util.js')

class PrefixCommand extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix', 'pre'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'prefix',
          type: 'lowercase',
        },
      ],
      description: 'See or set the prefix in a guild.',
    })
  }

  exec(msg, args) {
    const { prefix } = args
    if (!prefix) {
      return msg.util.info(stripIndents`
      current prefix in this guild is: **${this.client.db.guilds.get(msg.guild.id).prefix}**
    `)
    }
    if (!msg.member.permissions.has('MANAGE_GUILD')) return msg.util.error('you do not have permission to change the prefix in this guild.')

    this.client.db.guilds.set(msg.guild.id, { prefix })

    return msg.util.success(`prefix updated to: **${prefix}**`)
  }
}

module.exports = PrefixCommand
