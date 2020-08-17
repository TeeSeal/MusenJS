const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class PauseCommand extends Command {
  constructor () {
    super('pause', {
      aliases: ['pause'],
      channelRestriction: 'guild',
      description: 'Pause sound playback'
    })
  }

  async exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    if (msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (playlist.paused) return msg.util.error('playback is already paused.')

    await playlist.pause()
    const { playable } = playlist

    return new Embed(msg.channel)
      .setTitle(playable.title)
      .addField('Playback paused.', '\u200b')
      .setURL(playable.url)
      .setAuthor(msg.member)
      .setIcon(Embed.icons.PAUSE)
      .setColor(Embed.colors.YELLOW)
      .send()
  }
}

module.exports = PauseCommand
