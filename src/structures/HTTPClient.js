const fetch = require('node-fetch')
const { URL } = require('url')
const { version } = require('../../package.json')

class HTTPClient {
  constructor(opts) {
    this.baseURL = opts.baseURL
    this.params = opts.params || {}
    this.headers = Object.assign(
      { 'User-Agent': `Haku bot v${version} (https://github.com/TeeSeal/Haku)` },
      opts.headers
    )
  }

  get(url, type = 'json', params = {}) {
    if (type instanceof Object) {
      params = type
      type = 'json'
    }

    return fetch(this.buildURL(url, params), { headers: this.headers })
      .then(res => type === 'stream' ? res.body : res[type]())
  }

  buildURL(url, params) {
    url = new URL(url, this.baseURL)
    params = Object.assign({}, this.params, params)

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }

    return url.toString()
  }
}

module.exports = HTTPClient
