const fetch = require('node-fetch')
const { URLSearchParams } = require('url')
const { version } = require('../../package')

class HTTPClient {
  constructor (defaults = { headers: {}, baseURL: '', params: {} }) {
    this.baseURL = defaults.baseURL
    this.defaultQueryStringParams = defaults.params
    this.defaultHeaders = {
      ...defaults.headers,
      'User-Agent': `Musen v${version} (https://github.com/TeeSeal/Musen)`
    }
  }

  get (url, options = {}) {
    return this.request(url, { ...options, method: 'get' })
  }

  post (url, options = {}) {
    return this.request(url, { ...options, method: 'post' })
  }

  request (url, options = {}) {
    url = this.baseURL + url
    options = { ...options }
    options.headers = { ...this.defaultHeaders, ...options.headers }
    options.params = { ...this.defaultQueryStringParams, ...options.params }

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(options.params)) params.set(key, value)
    if (params.toString().length > 0) url += `?${params.toString()}`

    return fetch(url, options)
      .then(res => res.json().catch(() => res.text()))
  }
}

module.exports = HTTPClient
