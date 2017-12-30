class RadioConnection {
  constructor(handler, voiceChannel, opts) {
    this.id = voiceChannel.guild.id
    this.voiceChannel = voiceChannel
    this.station = null
    this.conn = null
    this.dispatcher = null
    this._volume = isNaN(opts.volume) ? 1 : this.convert(opts.volume)
    this.handler = handler
  }

  async connect() {
    this.conn = await this.voiceChannel.join()
  }

  play(station) {
    if (!this.conn) return
    if (this.station && this.station.id !== station.id) { this.station.removeConnection(this) }
    if (this.dispatcher) this.dispatcher.end()
    if (!station.broadcast) station.createBroadcast()

    this.station = station
    this.dispatcher = this.conn.playBroadcast(station.broadcast)
    station.addConnection(this)
    return this
  }

  setVolume(volume) {
    this._volume = this.convert(volume)
    this.dispatcher.setVolume(this._volume)
  }

  switchTo(voiceChannel) {
    this.voiceChannel = voiceChannel
    return this.connect()
  }

  disconnect() {
    this.station.removeConnection(this)
    this.dispatcher.end()
    this.voiceChannel.leave()
    this.handler.connections.delete(this.id)
  }

  convert(volume) {
    return volume / 100
  }
  get volume() {
    return this._volume * 100
  }
}
module.exports = RadioConnection
