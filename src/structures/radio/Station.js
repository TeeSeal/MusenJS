const { buildEmbed } = require('../../util/Util.js')
const Collection = require('../Collection.js')
const logr = require('logr')

class Station {
  constructor(provider, options) {
    this.id = options.id
    this.name = options.name
    this.nowPlaying = options.nowPlaying
    this.thumbnail = options.thumbnail
    this.stream = options.stream
    this.online = options.online || false
    this.extra = options.extra || {}
    this.url = options.url

    this.provider = provider
    this.handler = provider.handler
    this.connections = new Collection()
    this.broadcast = null

    this.createBroadcast()
  }

  delete() { return this.handler.deleteStation(this) }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      providerID: this.provider.id,
    }
  }

  embed() {
    return buildEmbed({
      title: this.name,
      description: this.nowPlaying || 'Offline',
      url: this.url,
      thumbnail: this.thumbnail,
      color: this.online ? 'green' : 'red',
    })
  }

  createBroadcast() {
    if (this.broadcast) {
      this.broadcast.removeAllListeners()
      this.broadcast.end()
    }

    this.broadcast = this.handler.client.createVoiceBroadcast().playArbitraryInput(this.stream)
      .on('warn', logr.warn)
      .on('error', logr.error)
  }

  playOn(connection) {
    this.connections.set(connection.id, connection)
    const dispatcher = connection.conn.playBroadcast(this.broadcast)
    dispatcher.once('end', () => this.connections.delete(connection.id))
    return dispatcher
  }

  async refresh() {
    const updated = await this.handler.refreshStation(this)
    if (!updated) return

    this.nowPlaying = updated.nowPlaying
    this.stream = updated.stream
    this.online = updated.online || false
    this.extra = updated.extra
    this.url = updated.url

    return this
  }
}

module.exports = Station
