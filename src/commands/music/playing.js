const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class PlayingCommand extends Command {
  constructor () {
    super('playing', {
      aliases: ['playing', 'nowplaying', 'np', 'time'],
      channelRestriction: 'guild',
      description: 'Show details on the currently palying track.'
    })
  }

  exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    const { track } = playlist

    return new Embed(msg.channel)
      .setTitle(track.title)
      .setURL(track.url)
      .setAuthor(msg.member)
      .addField(track.time, `Volume: ${playlist.volume}%`)
      .setIcon(Embed.icons.TIME)
      .setColor(Embed.colors.PURPLE)
      .send()
  }
}

module.exports = PlayingCommand
