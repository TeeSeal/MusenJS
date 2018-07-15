const MusicProvider = require('./MusicProvider')
const Playlist = require('./Playlist')
const { Setting } = require('../../db')

const providers = MusicProvider.loadAll()
const playlists = new Map()

class Music {
  static resolvePlayables (queries, opts) {
    const promises = queries.map(async query => {
      const words = query.split(' ')
      const provider = Music.resolveProvider(words)
      const playables = await provider.resolvePlayables(words.join(' '), opts)
      return playables || []
    })

    return Promise.all(promises).then(arr =>
      arr.reduce((a1, a2) => a1.concat(a2), [])
    )
  }

  static getPlaylist (msg, opts) {
    if (playlists.has(msg.guild.id)) {
      return playlists.get(msg.guild.id)
    }

    const playlist = new Playlist(msg, opts, this)
    playlists.set(msg.guild.id, playlist)
    return playlist
  }

  static get playlists () {
    return playlists
  }

  static resolveProvider (words) {
    const found = providers.find(provider => {
      if (words.some(word => word.startsWith('~'))) {
        const alias = words.find(word => word.startsWith('~'))

        if (provider.aliases.includes(alias.slice(1))) {
          words.splice(words.indexOf(alias), 1)
          return true
        }
      }

      return provider.REGEXP.test(words)
    })

    return found || providers.get(Setting.get('defaultMusicProvider'))
  }
}

module.exports = Music
