const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const Music = require('../../struct/music')

class PlayingCommand extends Command {
  constructor() {
    super('playing', {
      aliases: ['playing', 'nowplaying', 'np', 'time'],
      channelRestriction: 'guild',
      description: 'Show details on the currently palying song.',
    })
  }

  exec(msg) {
    const playlist = Music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    const { song } = playlist

    return new Embed(msg.channel)
      .setTitle(song.title)
      .setURL(song.url)
      .setAuthor(msg.member)
      .addField(song.time, `Volume: ${playlist.volume}%`)
      .setIcon(Embed.icons.TIME)
      .setColor(Embed.colors.PURPLE)
      .send()
  }
}

module.exports = PlayingCommand
