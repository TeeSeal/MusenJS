const Collection = require('../Collection.js')
const HTTPClient = require('../HTTPClient.js')
const Station = require('./Station.js')
const fs = require('fs')
const path = require('path')

const providersPath = path.join(__dirname, 'providers')

class RadioProvider extends HTTPClient {
  resolveStation() {
    throw new Error('not implemented.')
  }
  createStation(opts) {
    return new Station(this, opts)
  }
  static get keychainKey() {
    return ''
  }
  static get REGEXP() {
    return /()/
  }
  static get aliases() {
    return []
  }

  static loadAll(keychain, handler) {
    const providers = fs.readdirSync(providersPath).map(file => {
      const Provider = require(path.join(providersPath, file))
      return new Provider(handler, keychain[Provider.keychainKey])
    })

    return new Collection(
      providers.map(provider => {
        return [provider.constructor.name.toLowerCase(), provider]
      })
    )
  }
}

module.exports = RadioProvider
