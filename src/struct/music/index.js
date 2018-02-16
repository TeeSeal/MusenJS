const MusicProvider = require('./MusicProvider')
const Playlist = require('./Playlist')
const { Setting } = require('../../db')

const providers = MusicProvider.loadAll()
const playlists = new Map()

class Music {
  static resolvePlayables(queries, opts) {
    const promises = queries.map(async query => {
      const provider = Music.resolveProvider(query)
      const playables = await provider.resolvePlayables(query, opts)
      return playables || []
    })

    return Promise.all(promises).then(arr =>
      arr.reduce((a1, a2) => a1.concat(a2), [])
    )
  }

  static getPlaylist(msg, opts) {
    if (playlists.has(msg.guild.id)) {
      return playlists.get(msg.guild.id)
    }

    const playlist = new Playlist(msg, opts, this)
    playlists.set(msg.guild.id, playlist)
    return playlist
  }

  static get playlists() {
    return playlists
  }

  static resolveProvider(query) {
    const found = providers.find(prov => {
      if (query.includes('~')) {
        const alias = query.split(' ').find(word => word.startsWith('~'))

        if (prov.aliases.includes(alias.slice(1))) {
          const words = query.split(' ')
          words.splice(words.indexOf(alias), 1)
          query = words.join(' ')
          return true
        }
      }

      return prov.REGEXP.test(query)
    })

    return found || providers.get(Setting.get('defaultMusicProvider'))
  }
}

module.exports = Music
