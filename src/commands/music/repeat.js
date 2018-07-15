const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util')
const Music = require('../../struct/music')

class RepeatCommand extends Command {
  constructor () {
    super('repeat', {
      aliases: ['repeat', 'replay'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'times',
          type: word => {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            if (num < 1) return 1
            if (num > 100) return 100
            return num
          }
        },
        {
          id: 'end',
          match: 'flag',
          prefix: '-end'
        }
      ],
      description: stripIndents`
        Replay the currently playing track.
        **Optional arguments**
        \`times\` - the amount of times to replay the track.

        **Optional flags:**
        \`-end\` - add the song to the end of the queue rather than the beginning.

        **Usage:**
        \`repeat 5\` => will repeat the currently playing track 5 times.
        \`repeat 5 -end\` => will add the currently playing track to the end of the queue 5 times.
      `
    })
  }

  exec (msg, { times, end }) {
    const playlist = Music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (times + playlist.queue.length > playlist.songLimit) {
      times = playlist.songLimit - playlist.queue.length - 1
    }

    const arr = Array(times).fill(playlist.playable)
    playlist.queue = end
      ? playlist.queue.concat(arr)
      : arr.concat(playlist.queue)

    return msg.util.success(
      `The track will be replayed ${times ? `${times} times` : ''} ${
        end ? 'at the end of the queue' : 'after this one'
      }.`
    )
  }
}

module.exports = RepeatCommand
