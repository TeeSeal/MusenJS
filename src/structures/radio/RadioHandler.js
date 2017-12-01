const RadioProvider = require('./RadioProvider.js')
const RadioConnection = require('./RadioConnection.js')
const Collection = require('../Collection.js')

class RadioHandler {
  constructor(keychain) {
    this.providers = RadioProvider.loadAll(keychain, this)
    this.connections = new Collection()

    this.stations = null
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
  }

  findStation(query) {
    return this.stations.find(station => station.name === query.toLowerCase())
  }

  async addStation(name) {
    const provider = this.providers.first()
    const station = await provider.resolveStation(name.toLowerCase())
    if (!station) return null

    this.stations.set(station.id, station)
    this.db.set(station.id, station.toJSON())
    return station
  }

  async connect(voiceChannel) {
    const connection = new RadioConnection({ volume: 1 }, voiceChannel)
    await connection.connect()
    this.connections.set(connection.id, connection)
    return connection
  }

  deleteStation(station) {
    this.stations.delete(station.id)
    if (!this.db.items.has(station.id)) return
    return this.db.clear(station.id)
  }
}

module.exports = RadioHandler
