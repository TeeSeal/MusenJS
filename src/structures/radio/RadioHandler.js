const RadioProvider = require('./RadioProvider.js')
const RadioConnection = require('./RadioConnection.js')
const Collection = require('../Collection.js')

class RadioHandler {
  constructor(keychain, { stationRefreshTimeout }) {
    this.stationRefreshTimeout = stationRefreshTimeout * 6e4
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

  async connect(voiceChannel, options) {
    const connection = new RadioConnection(this, voiceChannel, options)
    await connection.connect()
    this.connections.set(connection.id, connection)
    return connection
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

  async refreshStation(station) {
    if (this.stations) return
    const newStation = await station.provider.resolveStation(station.name)
    if (!newStation) return this.stations.delete(station.id)

    this.stations.set(station.id, newStation)
    return station
  }

  deleteStation(station) {
    this.stations.delete(station.id)
    if (!this.db.items.has(station.id)) return
    return this.db.clear(station.id)
  }
}

module.exports = RadioHandler
