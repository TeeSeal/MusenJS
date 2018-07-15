const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util')
const { Guild } = require('../../db')

class PrefixCommand extends Command {
  constructor () {
    super('prefix', {
      aliases: ['prefix', 'pre'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'prefix',
          type: 'lowercase'
        }
      ],
      description: 'See or set the prefix in a guild.'
    })
  }

  exec (msg, args) {
    const { prefix } = args
    if (!prefix) {
      return msg.util.info(stripIndents`
      current prefix in this guild is: **${Guild.get(msg.guild.id).prefix}**
    `)
    }
    if (!msg.member.permissions.has('MANAGE_GUILD')) {
      return msg.util.error(
        'you do not have permission to change the prefix in this guild.'
      )
    }

    Guild.set(msg.guild.id, { prefix })

    return msg.util.success(`prefix updated to: **${prefix}**`)
  }
}

module.exports = PrefixCommand
