const Song = require('./Song')
const Playlist = require('./Playlist')
const MusicProvider = require('./MusicProvider')
const { Setting } = require('../../db')

const providers = MusicProvider.loadAll()
const playlists = new Map()

class MusicHandler {
  static resolveSongs(queries, opts) {
    return Promise.all(
      queries.map(async query => {
        const provider
          = providers.find(prov => {
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
          }) || providers.get(Setting.get('defaultMusicProvider'))

        const songs = await provider.resolveResource(query)

        if (!songs || songs.length === 0) return []
        return songs.map(song => new Song(song, opts))
      })
    ).then(arr => arr.reduce((a1, a2) => a1.concat(a2), []))
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
}

module.exports = MusicHandler
