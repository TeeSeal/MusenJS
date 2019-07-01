const { Command, Argument } = require('discord-akairo')
const { stripIndents } = require('../../util')
const Music = require('../../struct/music')
const { Guild } = require('../../db')

class SetCommand extends Command {
  constructor () {
    super('set', {
      aliases: ['default', 'def', 'set'],
      channelRestriction: 'guild',
      userPermissions: ['MANAGE_GUILD'],
      args: [
        {
          id: 'maxSongDuration',
          match: 'option',
          flag: ['--duration', '--length', '-d'],
          type: Argument.range('integer', 1, 240, true)
        },
        {
          id: 'defaultVolume',
          match: 'option',
          flag: ['--default-volume', '--volume', '-v'],
          type: Argument.range('integer', 1, 100, true)
        },
        {
          id: 'maxVolume',
          match: 'option',
          flag: ['--max-volume', '--max-vol=', '-V'],
          type: Argument.range('integer', 1, 100, true)
        },
        {
          id: 'songLimit',
          match: 'option',
          flag: ['--song-limit=', '--songs', '--max-songs', '-l'],
          type: Argument.range('integer', 1, 100, true)
        }
      ],
      description: stripIndents`
        Set some default values for the guild.
        **Optional arguments:** (must have at least 1)
        \`duration\` - the maximum song duration for this guild (in minutes).
        \`volume\` - the default song volume for this guild (in %).
        \`maxVolume\` - the maximum song volume for this guild (in %).
        \`songLimit\` - the maximum amount of songs one can have in a playlist.

        **Usage:**
        \`set --duration 20 --default-volume 30 --max-volume 70\` => sets the values.
        \`set --duration 20 -v 30 -V 70\` => shortcuts.
      `
    })
  }

  exec (msg, args) {
    const { maxSongDuration, defaultVolume, maxVolume, songLimit } = args
    if (!Object.keys(args).some(key => args[key])) {
      return msg.util.error('what are you trying to update?')
    }

    const {
      defaultVolume: dbDefaultVolume,
      maxVolume: dbMaxVolume
    } = Guild.get(msg.guild.id)
    const playlist = Music.playlists.get(msg.guild.id)
    const obj = {}

    if (maxSongDuration) {
      if (playlist) playlist.maxSongDuration = maxSongDuration
      obj.maxSongDuration = maxSongDuration
    }

    if (defaultVolume) {
      if (maxVolume || dbMaxVolume < defaultVolume) {
        return msg.util.error(
          'default volume can\'t be bigger than the maximum one.'
        )
      }
      if (playlist) playlist.defaultVolume = playlist.convertVolume(defaultVolume)
      obj.defaultVolume = defaultVolume
    }

    if (maxVolume) {
      if (defaultVolume || dbDefaultVolume > maxVolume) {
        return msg.util.error(
          'maximum volume can\'t be smaller than the default one.'
        )
      }
      if (defaultVolume && maxVolume < defaultVolume) {
        if (playlist && playlist.volume > maxVolume) {
          playlist.setVolume(maxVolume)
        }
      }
      obj.maxVolume = maxVolume
    }

    if (songLimit) {
      if (playlist) playlist.songLimit = songLimit
      obj.songLimit = songLimit
    }

    const expression = getExpression(obj)
    Guild.set(msg.guild.id, obj)

    return msg.util.success(`updated ${expression}.`)
  }
}

function getExpression (obj) {
  const arr = Object.keys(obj).map(key => `**${key}**(${obj[key]})`)
  if (arr.length === 1) return arr[0]
  const last = arr.pop()
  return `${arr.join(', ')} and ${last}`
}

module.exports = SetCommand
