const RadioProvider = require('./RadioProvider.js')
const Collection = require('../Collection.js')

class RadioHandler {
  constructor(keychain) {
    this.providers = RadioProvider.loadAll(keychain)
    this.stations = null
  }

  async init(db) {
    const promises = this.providers.map(provider => {
      const stationNames = db.providers.get(provider.id).stations
      return stationNames.map(name => provider.resolveStation(name))
    }).reduce((reduced, stations) => reduced.concat(stations), [])

    const resolved = await Promise.all(promises)
    this.stations = new Collection(resolved.map(station => [station.name, station]))
  }

  async addStation(name) {
    const provider = this.providers.first()
    const station = await provider.resolveStation(name)
    this.stations.set(station.name, station)
    return station
  }
}

module.exports = RadioHandler
