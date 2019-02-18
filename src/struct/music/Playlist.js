const { shuffle } = require('../../util')
const { EventEmitter } = require('events')

class Playlist extends EventEmitter {
  constructor (id, guildOptions, handler) {
    super()
    this.id = id
    this.handler = handler

    this.queue = []

    this.playable = null
    this.connection = null
    this.paused = false
    this.stopped = false
    this.started = false

    this._volume = this.convertVolume(guildOptions.defaultVolume)
    this.playableLimit = guildOptions.songLimit
  }

  async connect (voiceChannel) {
    this.connection = await voiceChannel.join()
    return this
  }

  play () {
    this.playNext(this.queue.shift())
    this.started = true
    return this
  }

  filter (playables) {
    const removed = []
    const added = playables

    const diff = this.queue.length + added.length - this.playableLimit
    if (diff > 0) {
      for (const playable of added.splice(added.length - diff, diff)) {
        removed.push({
          playable,
          reason: `playlist item limit reached. (max. **${
            this.playableLimit
          }** items)`
        })
      }
    }

    return { added, removed }
  }

  async playNext (playable) {
    if (this.stopped) return

    if (!playable) {
      this.emit('out')
      return this.destroy()
    }

    this.playable = playable
    this._volume = this.convertVolume(playable.volume) || this.defaultVolume

    let dispatcher
    try {
      dispatcher = await playable.play(this.connection, {
        volume: this._volume
      })
    } catch (err) {
      this.emit('error', err)
    }

    if (!dispatcher) {
      this.emit('unavailable', playable)
      return this.playNext(this.queue.shift())
    }

    this.emit('playing', playable)
    dispatcher
      .on('error', console.error)
      .on('finish', () => {
        this.emit('end', playable)
        return setTimeout(() => this.playNext(this.queue.shift()), 10)
      })
  }

  add (playables) {
    const result = this.filter(playables)
    this.queue.push(...result.added)
    return result
  }

  shuffle () {
    shuffle(this.queue)
    return this.queue
  }

  pause () {
    this.playable.dispatcher.pause()
    this.paused = true
    this.emit('pause')
    return this
  }

  resume () {
    this.playable.dispatcher.resume()
    this.paused = false
    this.emit('resume')
    return this
  }

  setVolume (volume) {
    this._volume = this.convertVolume(volume)
    this.playable.dispatcher.setVolume(this._volume)
    this.emit('volume', this.volume)
    return this.volume
  }

  fadeVolume (volume) {
    return new Promise(resolve => {
      if (volume === this.volume) return resolve(volume)
      let current = this._volume
      this._volume = this.convertVolume(volume)
      const modifier = current < this._volume ? 0.05 : -0.05

      const interval = setInterval(() => {
        current += modifier
        this.playable.dispatcher.setVolume(current)

        if (current > this._volume - 0.05 && current < this._volume + 0.05) {
          this.playable.dispatcher.setVolume(this._volume)
          clearInterval(interval)

          setTimeout(() => {
            this.emit('volume', this.volume)
            resolve(this.volume)
          }, 800)
        }
      }, 35)
    })
  }

  skip () {
    const playable = this.playable
    playable.dispatcher.end('skip')
    this.emit('skip', playable)
    return playable
  }

  stop () {
    this.queue = []
    this.stopped = true
    this.playable.dispatcher.end('stop')
    this.destroy()
    return this
  }

  destroy () {
    if (this.connection) this.connection.channel.leave()
    this.handler.playlists.delete(this.id)
    this.emit('destroy')
  }

  convertVolume (volume) {
    return volume / 100
  }

  get volume () {
    return this._volume * 100
  }
}

module.exports = Playlist
