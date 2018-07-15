const { Command } = require('discord-akairo')
const { stripIndents, parserInRange } = require('../../util')
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
          match: 'options',
          flag: ['duration=', 'length=', 'd='],
          type: parserInRange(1, 240)
        },
        {
          id: 'defaultVolume',
          match: 'options',
          flag: ['volume=', 'vol='],
          type: parserInRange(1, 100)
        },
        {
          id: 'maxVolume',
          match: 'options',
          flag: ['maxVolume=', 'maxVol=', 'mv='],
          type: parserInRange(1, 100)
        },
        {
          id: 'songLimit',
          match: 'options',
          flag: ['songLimit=', 'songs=', 'maxSongs=', 'sl='],
          type: parserInRange(1, 100)
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
        \`set duration=20 volume=30 maxVolume=70\` => sets the values.
        \`set duration=20 v=30 mv=70\` => shortcuts.
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
      if (playlist) playlist.defaultVolume = playlist.convert(defaultVolume)
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
