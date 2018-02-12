const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const Music = require('../../struct/music')

class ShuffleCommand extends Command {
  constructor() {
    super('shuffle', {
      aliases: ['shuffle'],
      channelRestriction: 'guild',
      description: 'Shuffle the current playlist.',
    })
  }

  exec(msg) {
    const playlist = Music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    playlist.shuffle()
    const items = [`**Now playing:** ${playlist.song.linkString}`].concat(
      playlist.queue.map(s => `• ${s.linkString}`)
    )

    return new Embed(msg.channel)
      .setTitle('Shuffled playlist:')
      .setDescription(items)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .send()
  }
}

module.exports = ShuffleCommand
