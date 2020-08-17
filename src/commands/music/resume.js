const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class ResumeCommand extends Command {
  constructor () {
    super('resume', {
      aliases: ['resume'],
      channelRestriction: 'guild',
      description: 'Resume paused playback.'
    })
  }

  exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    const memberChannelID = (msg.member.voice.channel || {}).id
    if (memberChannelID !== playlist.player.channel) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (!playlist.paused) return msg.util.error('playback is not paused.')

    playlist.resume()
    const { playable } = playlist

    return new Embed(msg.channel)
      .setTitle(playable.title)
      .setURL(playable.url)
      .setAuthor(msg.member)
      .addField('Playback resumed.', '\u200b')
      .setIcon(Embed.icons.PLAY)
      .setColor(Embed.colors.GREEN)
      .send()
  }
}

module.exports = ResumeCommand
