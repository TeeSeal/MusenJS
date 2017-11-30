const axios = require('axios')
const { version } = require('../../package.json')

class HTTPClient {
  constructor(options) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      timeout: 5000,
      headers: Object.assign(
        { 'User-Agent': `Haku bot v${version} (https://github.com/TeeSeal/Haku)` },
        options.headers
      ),
    })

    this.defaultParams = options.defaultParams || {}
  }

  get(url, parameters) {
    const params = Object.assign({}, this.defaultParams, parameters || {})
    return this.instance.request({ url, params })
      .then(res => res.data)
  }

  post(url, options) {
    return this.request(Object.assign(options, { method: 'post', url }))
      .then(res => res.data)
  }

  request(options) {
    return this.instance.request(options)
  }
}

module.exports = HTTPClient
