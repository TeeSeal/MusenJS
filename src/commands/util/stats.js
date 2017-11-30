const { Command } = require('discord-akairo')
const { buildEmbed, stripIndents } = require('../../util/Util.js')
const { version } = require('../../../package.json')
const moment = require('moment')
require('moment-duration-format')

class StatsCommand extends Command {
  constructor() {
    super('stats', {
      aliases: ['stats'],
      description: 'Get some information about the bot.',
    })
  }

  exec(msg) {
    const uptime = moment.duration(this.client.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]')
    const memUsage = Object.entries(process.memoryUsage())
      .map(([key, value]) => `${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`)
      .join('\n')

    const general = stripIndents`
      Guilds: ${this.client.guilds.size}
      Channels: ${this.client.channels.size}
    `

    msg.channel.send(buildEmbed({
      title: `Haku stats`,
      fields: [
        ['Memory Usage', memUsage, true],
        ['Uptime', uptime, true],
        ['General', general, true],
        ['Version', version, true],
      ],
      color: 'cyan',
      thumbnail: this.client.user.avatarURL(),
      footer: '© TeeSeal#0110',
    }))
  }
}

module.exports = StatsCommand
