class RadioConnection {
  constructor(options, voiceChannel) {
    this.id = voiceChannel.guild.id
    this.voiceChannel = voiceChannel
    this.station = null
    this.conn = null
    this.dispatcher = null
    this._volume = this.convert(options.volume) || 1
  }

  async connect() { this.conn = await this.voiceChannel.join() }

  play(station) {
    if (!this.conn) return
    if (this.dispatcher) this.dispatcher.end()
    this.station = station
    this.dispatcher = this.conn.playStream(station.stream)
  }

  setVolume(volume) {
    this._volume = this.convert(volume)
    this.dispatcher.setVolume(this._volume)
  }

  stop() {
    this.voiceChannel.leave()
    this.handler.connections.delete(this.id)
  }

  convert(volume) { return volume / 50 }
  get volume() { return this._volume * 50 }
}
module.exports = RadioConnection
