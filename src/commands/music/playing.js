const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class PlayingCommand extends Command {
  constructor () {
    super('playing', {
      aliases: ['playing', 'nowplaying', 'np', 'time'],
      channelRestriction: 'guild',
      description: 'Show details on the currently palying song.'
    })
  }

  exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    const { playable } = playlist

    return new Embed(msg.channel)
      .setTitle(playable.title)
      .setURL(playable.url)
      .setAuthor(msg.member)
      .addField(playable.time, `Volume: ${playlist.volume}%`)
      .setIcon(Embed.icons.TIME)
      .setColor(Embed.colors.PURPLE)
      .send()
  }
}

module.exports = PlayingCommand
