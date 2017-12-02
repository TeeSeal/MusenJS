const { buildEmbed } = require('../../util/Util.js')

class Station {
  constructor(provider, options) {
    this.id = `${provider.id}-${options.name}`
    this.name = options.name
    this.displayName = options.displayName
    this.nowPlaying = options.nowPlaying
    this.startedAt = options.startedAt
    this.thumbnail = options.thumbnail
    this.stream = options.stream
    this.online = options.online || false
    this.extra = options.extra || {}

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
      title: this.displayName,
      description: this.nowPlaying || 'Offline',
      thumbnail: this.thumbnail,
      color: this.online ? 'green' : 'red',
    })
  }

  refresh() {
    return this.handler.refreshStation(this)
  }
}

module.exports = Station
