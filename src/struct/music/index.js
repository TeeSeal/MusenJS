const Playlist = require('./Playlist')
const Playable = require('./Playable')
const { Node } = require('lavalink')
const logr = require('logr')

class MusicManager {
  constructor (client, config) {
    this.playlists = new Map()
    this.client = client
    this.config = config
    this.lavalink = null
  }

  init () {
    this.lavalink = new Node({
      host: `${this.config.host}:${this.config.port}`,
      password: this.config.password,
      userID: this.client.user.id,
      shards: this.client.ws.shards.size,
      send: (id, packet) => {
        const guild = this.client.guilds.cache.get(id)
        if (!guild) return
        guild.shard.send(packet)
      }
    })

    this.lavalink.on('error', err => {
      if (['ECONNREFUSED', 'ECONNRESET'].includes(err.code)) {
        return logr.error("Couldn't connect to lavalink. Retrying...")
      }

      this.client.logError(err)
    })

    this.client.on('raw', pk => {
      if (pk.t === 'VOICE_STATE_UPDATE') this.lavalink.voiceStateUpdate(pk.d)
      if (pk.t === 'VOICE_SERVER_UPDATE') this.lavalink.voiceServerUpdate(pk.d)
    })

    return new Promise(resolve => {
      this.lavalink.on('open', resolve)
    })
  }

  async resolvePlayables (query, opts) {
    const results = await this.lavalink.load(`ytsearch:${query}`)
    return (results?.tracks?.slice(0, 1) || []).map(track => new Playable(track, opts))
  }

  getPlaylist (id, opts) {
    return this.playlists.get(id)
  }

  getOrCreatePlaylist (id, opts) {
    let playlist = this.getPlaylist(id, opts)
    if (playlist) return playlist

    playlist = new Playlist(id, opts, this)
    this.playlists.set(id, playlist)
    return playlist
  }
}

module.exports = MusicManager
