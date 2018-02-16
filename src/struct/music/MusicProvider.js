const Collection = require('../Collection')
const HTTPClient = require('../HTTPClient')
const Playable = require('./Playable')
const { join } = require('path')
const { recursiveReadDirSync } = require('../../util')

class MusicProvider extends HTTPClient {
  resolvePlayables() {
    throw new Error('not implemented.')
  }

  static get Playable() { return Playable }

  static get REGEXP() {
    throw new Error('not implemented.')
  }

  static get aliases() {
    throw new Error('not implemented.')
  }

  static loadAll() {
    const providersDir = join(__dirname, 'providers')
    const providers = recursiveReadDirSync(providersDir).map(file => {
      const Provider = require(file)
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
