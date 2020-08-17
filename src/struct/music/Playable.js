const moment = require('moment')
require('moment-duration-format')

class Playable {
  constructor ({ track, info }, opts = {}) {
    this.track = track
    this.id = info.identifier
    this.title = info.title
    this.live = info.isStream || false
    this.duration = this.isStream ? Infinity : info.length
    this.url = info.uri

    this.member = opts.member
    this.volume = opts.volume
    this.player = null
  }

  async play (player, opts) {
    this.player = player
    if (opts.volume) await player.setVolume(opts.volume)
    await this.player.play(this.track)

    return this.player
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
    const current = Playable.formatDuration(this.player.position)
    const left = Playable.formatDuration(this.duration - this.player.position)

    return `${current} / ${total}  |  ${left} left`
  }

  static formatDuration (time) {
    const duration = moment.duration(time)
    if (duration.minutes() > 0) return duration.format('hh:mm:ss')
    return `00:${duration.format('ss')}`
  }
}

module.exports = Playable
