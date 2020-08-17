const Playlist = require('./Playlist')
const Playable = require('./Playable')
const { Manager: LavaManager } = require('lavaclient')
const logr = require('logr')

class MusicManager {
  constructor (client, nodes) {
    this.playlists = new Map()
    this.client = client
    this.lavalink = new LavaManager(nodes, {
      shards: client.ws.shards.size,
      send (id, data) {
        const guild = client.guilds.cache.get(id)
        if (!guild) return
        guild.shard.send(data)
      }
    })
  }

  init () {
    this.lavalink.on('socketError', ({ _id }, error) => this.client.logError(error))
    this.lavalink.on('socketReady', (node) => logr.success(`${node.id} connected.`))

    this.client.ws.on('VOICE_STATE_UPDATE', (upd) => this.lavalink.stateUpdate(upd))
    this.client.ws.on('VOICE_SERVER_UPDATE', (upd) => this.lavalink.serverUpdate(upd))

    return this.lavalink.init(this.client.user.id)
  }

  async resolvePlayables (query, opts) {
    const results = await this.lavalink.search(`ytsearch:${query}`)
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
