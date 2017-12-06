const { buildEmbed } = require('../../util/Util.js')
const Collection = require('../Collection.js')
const logr = require('logr')

class Station {
  constructor(provider, opts) {
    this.id = opts.id
    this.name = opts.name
    this.nowPlaying = opts.nowPlaying
    this.thumbnail = opts.thumbnail
    this.stream = opts.stream
    this.online = opts.online || false
    this.extra = opts.extra || {}
    this.url = opts.url

    this.provider = provider
    this.handler = provider.handler
    this.connections = new Collection()
    this.broadcast = null
    this.supervisor = null
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
    const description = this.nowPlaying
      ? [this.nowPlaying, `Listeners: **${this.listenerCount}**`].join('\n')
      : 'Offline'

    return buildEmbed({
      title: this.name,
      description,
      url: this.url,
      thumbnail: this.thumbnail,
      color: this.online ? 'green' : 'red',
    })
  }

  get listenerCount() {
    if (!this.connections.size) return 0
    return this.connections.reduce((count, conn) => {
      return count + conn.voiceChannel.members.size - 1
    }, 0)
  }

  createBroadcast() {
    if (this.broadcast) this.broadcast.destroy()
    this.broadcast = this.handler.client.createVoiceBroadcast().playArbitraryInput(this.stream)
  }

  addConnection(connection) {
    this.connections.set(connection.id, connection)
    if (!this.supervisor) this.setSupervisor(connection)
  }

  removeConnection(connection) {
    this.connections.delete(connection.id)
    if (this.supervisor.id === connection.id) {
      this.unsetSupervisor()
      if (this.connections.size) this.setSupervisor(this.connections.first())
    }

    if (!this.connections.size) {
      logr.info(`No connections on ${this.name}. Destroying broadcast.`)
      this.broadcast.destroy()
      this.broadcast = null
    }
  }

  setSupervisor(connection) {
    if (!connection.dispatcher) return

    this.supervisor = connection
    connection.dispatcher.on('speaking', speaking => {
      if (!speaking) this.reset()
    })
  }

  unsetSupervisor() {
    if (!this.supervisor) return
    this.supervisor.dispatcher.removeAllListeners()
    this.supervisor = null
  }

  async reset() {
    logr.warn(`Resetting ${this.name}.`)
    this.unsetSupervisor()
    this.createBroadcast()
    for (const connection of this.connections.values()) connection.play()
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
