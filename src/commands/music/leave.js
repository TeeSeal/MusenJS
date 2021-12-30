const { Command } = require('discord-akairo')
const { canAdmin } = require('../../util')

class LeaveCommand extends Command {
  constructor () {
    super('leave', {
      aliases: ['leave', 'gtfo'],
      channelRestriction: 'guild',
      description: 'Stop playback and disconnect.'
    })
  }

  async exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    if (canAdmin(msg.member)) {
      await playlist.stop({ instant: true })
      return msg.util.success('alright, crashing the party.')
    }

    if (msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (playlist.playing) {
      return msg.util.error(
        'something is currently playing. Please end playback beforehand.'
      )
    }

    await playlist.stop({ instant: true })
    return msg.util.success('stopped playback.')
  }
}

module.exports = LeaveCommand
