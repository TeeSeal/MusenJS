const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class ShuffleCommand extends Command {
  constructor () {
    super('shuffle', {
      aliases: ['shuffle'],
      channelRestriction: 'guild',
      description: 'Shuffle the current playlist.'
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

    playlist.shuffle()
    const { playable, queue } = playlist
    const items = [`🔊 ${playable.formattedTitle}`].concat(
      queue.map(s => `• ${s.formattedTitle}`)
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
