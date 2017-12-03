const { buildEmbed } = require('../../util/Util.js')

class Station {
  constructor(provider, options) {
    this.id = options.id
    this.name = options.name
    this.nowPlaying = options.nowPlaying
    this.thumbnail = options.thumbnail
    this.stream = options.stream
    this.online = options.online || false
    this.extra = options.extra || {}
    this.url = options.url

    this.provider = provider
    this.handler = provider.handler

    setTimeout(() => this.refresh(), this.handler.stationRefreshTimeout)
  }

  delete() { return this.handler.deleteStation(this) }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      providerID: this.provider.id,
    }
  }

  embed() {
    return buildEmbed({
      title: this.name,
      description: this.nowPlaying || 'Offline',
      url: this.url,
      thumbnail: this.thumbnail,
      color: this.online ? 'green' : 'red',
    })
  }

  refresh() {
    return this.handler.refreshStation(this)
  }
}

module.exports = Station
