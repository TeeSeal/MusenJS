const { shuffle } = require('../../util')
const { EventEmitter } = require('events')

class Playlist extends EventEmitter {
  constructor (id, guildOptions, musicManager) {
    super()
    this.id = id
    this.manager = musicManager

    this.queue = []

    this.player = null
    this.playable = null
    this.paused = false
    this.stopped = false
    this.started = false

    this._volume = this.convertVolume(guildOptions.defaultVolume)
    this.playableLimit = guildOptions.songLimit
  }

  async connect (voiceChannel) {
    this.player = await this.manager.lavalink.create(this.id)
    await this.player.connect(voiceChannel)

    this.player.on('end', _event => {
      this.emit('end', this.playable)
      return setTimeout(() => this.playNext(this.queue.shift()), 10)
    })

    this.player.on('error', console.error)
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

    try {
      await playable.play(this.player, {
        volume: this._volume
      })
    } catch (err) {
      this.emit('unavailable', playable, err)
      return this.playNext(this.queue.shift())
    }

    this.emit('playing', playable)
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

  async pause () {
    await this.player.pause(true)
    this.paused = true
    this.emit('pause')
    return this
  }

  async resume () {
    await this.player.pause(false)
    this.paused = false
    this.emit('resume')
    return this
  }

  async setVolume (volume) {
    this._volume = this.convertVolume(volume)
    await this.player.setVolume(this._volume)
    this.emit('volume', this.volume)
    return this.volume
  }

  fadeVolume (volume) {
    return this.setVolume(volume)
  }

  async skip () {
    await this.player.stop()
    this.emit('skip', this.playable)
    return this.playable
  }

  async stop () {
    this.queue = []
    this.stopped = true
    await this.player.stop()
    this.destroy()
    return this
  }

  async destroy () {
    if (this.player) await this.player.destroy(true)
    this.manager.playlists.delete(this.id)
    this.emit('destroy')
  }

  convertVolume (volume) {
    return volume
  }

  get volume () {
    return this._volume
  }
}

module.exports = Playlist
