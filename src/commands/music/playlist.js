const { Command, Argument } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const Music = require('../../struct/music')

class PlaylistCommand extends Command {
  constructor () {
    super('playlist', {
      aliases: ['playlist', 'playlists', 'queue', 'q'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'page',
          match: 'option',
          flag: ['--page', '-p'],
          type: Argument.range('integer', 0, Infinity),
          default: 0
        }
      ],
      description: 'Shows the current playlist.'
    })
  }

  exec (msg, { page }) {
    const playlist = Music.playlists.get(msg.guild.id)
    if (!playlist) {
      return msg.util.error('nothing is currently playing.')
    }

    const { playable, queue } = playlist
    const items = [`🔊 ${playable.formattedTitle}`].concat(
      queue.map(s => `• ${s.formattedTitle}`)
    )

    return new Embed(msg.channel)
      .setTitle('Playlist:')
      .setDescription(items)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .setPage(page)
      .send()
  }
}

module.exports = PlaylistCommand
