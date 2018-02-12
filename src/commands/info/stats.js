const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util')
const Embed = require('../../struct/MusenEmbed')
const { version } = require('../../../package')
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
    const uptime = moment
      .duration(this.client.uptime)
      .format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]')
    const memUsage = Object.entries(process.memoryUsage())
      .map(
        ([key, value]) =>
          `${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`
      )
      .join('\n')

    const general = stripIndents`
      Guilds: ${this.client.guilds.size}
      Channels: ${this.client.channels.size}
    `

    return new Embed(msg.channel)
      .setTitle(`${this.client.user.username} stats`)
      .setFields([
        ['Memory Usage', memUsage, true],
        ['Uptime', uptime, true],
        ['General', general, true],
        ['Version', version, true],
      ])
      .setColor(Embed.colors.CYAN)
      .setThumbnail(this.client.user.avatarURL())
      .setFooter('© TeeSeal#0110')
      .send()
  }
}

module.exports = StatsCommand
