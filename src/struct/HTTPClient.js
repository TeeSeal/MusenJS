const { Axios } = require('axios')
const { version } = require('../../package')

class HTTPClient extends Axios {
  constructor (opts) {
    opts.headers = {
      'User-Agent': `Musen v${version} (https://github.com/TeeSeal/Musen)`,
      ...opts.headers
    }
    super(opts)
  }
}

module.exports = HTTPClient
