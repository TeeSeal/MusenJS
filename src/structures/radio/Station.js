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
    return buildEmbed({
      title: this.name,
      description: this.nowPlaying || 'Offline',
      url: this.url,
      thumbnail: this.thumbnail,
      color: this.online ? 'green' : 'red',
    })
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
      this.supervisor.dispatcher.removeAllListeners()

      if (!this.connections.size) {
        this.supervisor = null
      } else {
        this.setSupervisor(this.connections.first())
      }
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

  reset() {
    logr.warn(`${this.name} is resetting.`)
    this.unsetSupervisor()
    this.createBroadcast()
    this.connections.forEach(connection => connection.play(this))
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
