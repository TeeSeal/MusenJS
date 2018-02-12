const Collection = require('../Collection')
const HTTPClient = require('../HTTPClient')
const fs = require('fs')
const path = require('path')

const providersPath = path.join(__dirname, 'providers')

class MusicProvider extends HTTPClient {
  resolveResource() {
    throw new Error('not implemented.')
  }

  static get REGEXP() {
    throw new Error('not implemented.')
  }

  static get aliases() {
    throw new Error('not implemented.')
  }

  static loadAll() {
    const providers = fs.readdirSync(providersPath).map(file => {
      const Provider = require(path.join(providersPath, file))
      return new Provider()
    })

    return new Collection(
      providers.map(provider => {
        return [provider.constructor.name.toLowerCase(), provider]
      })
    )
  }
}

module.exports = MusicProvider
