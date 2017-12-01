class Station {
  constructor(options, provider) {
    this.id = `${provider.id}-${options.name}`
    this.name = options.name
    this.title = options.title
    this.startedAt = options.startedAt
    this.thumbnail = options.thumbnail
    this.stream = options.stream
    this.live = true
    this.extra = options.extra

    this.provider = provider
  }
}

module.exports = Station
