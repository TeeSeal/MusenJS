const { Command } = require('discord-akairo')
const { buildEmbed, stripIndents } = require('../../util/Util.js')

class VolumeCommand extends Command {
  constructor() {
    super('volume', {
      aliases: ['volume', 'vol'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'newVolume',
          type(word, msg) {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            const { maxVolume } = this.client.db.guilds.get(msg.guild.id)
            if (num < 1) return 1
            if (num > maxVolume) return maxVolume
            return num
          },
        },
      ],
      description: stripIndents`
        Change playback volume.
        Ranges from 1 to 100.

        **Usage:**
        \`volume 30\` => sets the volume to 30%.
      `,
    })
  }

  exec(msg, args) {
    const { newVolume } = args
    const connection = this.client.radio.connections.get(msg.guild.id)

    if (!connection) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error('you have to be in the voice channel I\'m currently in.')
    }

    const { volume, station } = connection

    if (!newVolume) {
      return msg.util.send(buildEmbed({
        title: station.nowPlaying,
        fields: [
          [`Volume: ${volume}%`, '\u200b'],
        ],
        url: station.url,
        author: msg.member,
        icon: 'volumeUp',
        color: 'yellow',
      }))
    }

    const icon = newVolume < volume ? 'volumeDown' : 'volumeUp'

    connection.fadeVolume(newVolume)
    return msg.util.send(buildEmbed({
      title: station.nowPlaying,
      fields: [
        [`Volume: ${newVolume}%`, '\u200b'],
      ],
      url: station.url,
      author: msg.member,
      icon,
      color: 'yellow',
    }))
  }
}

module.exports = VolumeCommand
