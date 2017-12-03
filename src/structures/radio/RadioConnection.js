class RadioConnection {
  constructor(handler, voiceChannel, options) {
    this.id = voiceChannel.guild.id
    this.voiceChannel = voiceChannel
    this.station = null
    this.conn = null
    this.dispatcher = null
    this._volume = isNaN(options.volume) ? 1 : this.convert(options.volume)
    this.handler = handler
  }

  async connect() { this.conn = await this.voiceChannel.join() }

  play(station) {
    if (!this.conn) return
    if (this.dispatcher) this.dispatcher.end()
    this.station = station

    this.dispatcher = this.conn.playStream(station.stream, { volume: this._volume })
    return this
  }

  setVolume(volume) {
    this._volume = this.convert(volume)
    this.dispatcher.setVolume(this._volume)
  }

  fadeVolume(volume) {
    let current = this._volume
    this._volume = this.convert(volume)
    const modifier = current < this._volume ? 0.05 : -0.05

    return new Promise(resolve => {
      const interval = setInterval(() => {
        current += modifier
        this.dispatcher.setVolume(current)

        if (current > (this._volume - 0.05) && current < (this._volume + 0.05)) {
          this.dispatcher.setVolume(this._volume)
          clearInterval(interval)
          setTimeout(resolve, 800)
        }
      }, 35)
    })
  }

  stop() {
    this.voiceChannel.leave()
    this.handler.connections.delete(this.id)
  }

  convert(volume) { return volume / 50 }
  get volume() { return this._volume * 50 }
}
module.exports = RadioConnection
