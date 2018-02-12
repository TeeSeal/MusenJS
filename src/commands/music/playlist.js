const { Command } = require('discord-akairo')
const { parserInRange } = require('../../util')
const Embed = require('../../struct/MusenEmbed')
const Music = require('../../struct/music')

class PlaylistCommand extends Command {
  constructor() {
    super('playlist', {
      aliases: ['playlist', 'playlists', 'queue', 'q'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: parserInRange(0),
          default: 0,
        },
        {
          id: 'name',
          type: 'lowercase',
        },
      ],
      description: 'Shows the current playlist.',
    })
  }

  exec(msg, { page }) {
    const playlist = Music.playlists.get(msg.guild.id)
    const [song, queue] = playlist
      ? [playlist.song, playlist.queue]
      : [null, null]

    if (!playlist) {
      return msg.util.error('nothing is currently playing.')
    }

    const items = [`**Now playing:** ${song.linkString}`].concat(
      queue.map(s => `• ${s.linkString}`)
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
