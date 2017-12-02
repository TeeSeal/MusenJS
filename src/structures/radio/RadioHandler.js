const Fuse = require('fuse.js')

const RadioProvider = require('./RadioProvider.js')
const RadioConnection = require('./RadioConnection.js')
const Collection = require('../Collection.js')

class RadioHandler {
  constructor(keychain, { stationRefreshTimeout }) {
    this.stationRefreshTimeout = stationRefreshTimeout * 6e4
    this.providers = RadioProvider.loadAll(keychain, this)
    this.connections = new Collection()

    this.stations = null
    this.fuse = null
    this.db = null
  }

  async init(db) {
    this.db = db
    const promises = db.items.map(station => {
      const provider = this.providers.get(station.providerID)
      return provider.resolveStation(station.name)
    })

    const resolved = await Promise.all(promises)
    this.stations = new Collection(resolved.map(station => [station.id, station]))
    this.initFuse()
    return this
  }

  initFuse() {
    const formatted = this.stations.map(station => {
      return { id: station.id, name: station.displayName, provider: station.provider.name }
    })

    this.fuse = new Fuse(formatted, {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name', 'provider'],
      id: 'id',
    })
  }

  async connect(voiceChannel, options) {
    const connection = new RadioConnection(this, voiceChannel, options)
    await connection.connect()
    this.connections.set(connection.id, connection)
    return connection
  }

  findStation(query) {
    const id = this.fuse.search(query)[0]
    if (!id) return null
    return this.stations.get(id)
  }

  async addStation(name) {
    const provider = this.providers.first()
    const station = await provider.resolveStation(name.toLowerCase())
    if (!station) return null

    this.stations.set(station.id, station)
    this.initFuse()
    this.db.set(station.id, station.toJSON())
    return station
  }

  async refreshStation(station) {
    if (!this.stations) return
    const newStation = await station.provider.resolveStation(station.name)
    if (!newStation) return this.stations.delete(station.id)

    this.stations.set(station.id, newStation)
    return newStation
  }

  deleteStation(station) {
    this.stations.delete(station.id)
    this.initFuse()
    if (!this.db.items.has(station.id)) return
    return this.db.clear(station.id)
  }
}

module.exports = RadioHandler
