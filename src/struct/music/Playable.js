const moment = require('moment')
require('moment-duration-format')

class Playable {
  constructor (data, provider, opts = {}) {
    this.provider = provider

    this.id = data.id
    this.title = data.title
    this.thumbnail = data.thumbnail
    this.live = data.live || false
    this.duration = this.live ? Infinity : data.duration
    this.url = data.url
    this.stream = data.stream

    this.member = opts.member
    this.volume = opts.volume
    this.dispatcher = null
  }

  async play (connection, opts) {
    const stream = await this.fetchStream()
    if (!stream) return null

    this.dispatcher = connection.play(stream, opts)
    return this.dispatcher
  }

  toString () {
    return this.title
  }

  get durationString () {
    return this.live ? 'live' : Playable.formatDuration(this.duration)
  }

  get link () {
    return `[${this.title}](${this.url})`
  }

  get formattedTitle () {
    return `${this.link} (${this.durationString})`
  }

  get formattedDuration () {
    return this.live ? '🔴 Live' : `Duration: ${this.durationString}`
  }

  get time () {
    const total = Playable.formatDuration(this.duration)
    const current = Playable.formatDuration(this.dispatcher.streamTime)
    const left = Playable.formatDuration(this.duration - this.dispatcher.streamTime + 1000)

    return `${current} / ${total}  |  ${left} left`
  }

  fetchStream () {
    if (this.stream) return this.stream
    return this.provider.fetchStream(this)
  }

  static formatDuration (time) {
    const duration = moment.duration(time)
    if (duration.minutes() > 0) return duration.format('hh:mm:ss')
    return `00:${duration.format('ss')}`
  }
}

module.exports = Playable
