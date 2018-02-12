const { Axios } = require('axios')
const { version } = require('../../package')

class HTTPClient extends Axios {
  constructor(opts) {
    opts.headers = {
      'User-Agent': `Haku bot v${version} (https://github.com/TeeSeal/Haku)`,
      ...opts.headers
    }
    super(opts)
  }
}

module.exports = HTTPClient
