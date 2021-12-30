const { shuffle } = require('../../util')
const { EventEmitter } = require('events')

const DESTROY_TIMEOUT = 180000

class Playlist extends EventEmitter {
  constructor (id, guildOptions, musicManager) {
    super()
    this.id = id
    this.manager = musicManager

    this.queue = []

    this.player = null
    this.channel = null
    this.track = null
    this.paused = false
    this.started = false
    this.playing = false

    this.destroyTimeout = null

    this._volume = this.convertVolume(guildOptions.defaultVolume)
    this.trackLimit = guildOptions.trackLimit
  }

  async connect (voiceChannel) {
    this.channel = voiceChannel
    this.player = await this.manager.lavalink.players.get(this.id)
    await this.player.join(voiceChannel.id)

    this.player.on('playerUpdate', ({ state: { position } }) => {
      this.player.position = position
    })

    this.player.on('event', data => {
      if (data.type === 'TrackEndEvent') {
        this.emit('end', this.track)
        return setTimeout(() => this.playNext(this.queue.shift()), 10)
      }

      if (data.type === 'TrackExceptionEvent') console.error(data)
    })

    return this
  }

  play () {
    this.cancelDestroy()
    this.playNext(this.queue.shift())
    this.started = true
    this.playing = true
    return this
  }

  filter (tracks) {
    const removed = []
    const added = tracks

    const diff = this.queue.length + added.length - this.trackLimit
    if (diff > 0) {
      for (const track of added.splice(added.length - diff, diff)) {
        removed.push({
          track,
          reason: `playlist item limit reached. (max. **${
            this.trackLimit
          }** items)`
        })
      }
    }

    return { added, removed }
  }

  async playNext (track) {
    if (!track) {
      this.emit('out')
      return this.delayedDestroy()
    }

    this.track = track
    this._volume = this.convertVolume(track.volume) || this.defaultVolume

    try {
      await track.play(this.player, {
        volume: this._volume
      })
    } catch (err) {
      this.emit('unavailable', track, err)
      return this.playNext(this.queue.shift())
    }

    this.emit('playing', track)
  }

  add (tracks) {
    const result = this.filter(tracks)
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
    this.emit('skip', this.track)
    return this.track
  }

  async stop ({ instant = false } = {}) {
    this.queue = []
    await this.player.stop()

    if (instant) this.destroy()
    else this.delayedDestroy()

    return this
  }

  delayedDestroy () {
    this.playing = false
    this.destroyTimeout = setTimeout(() => {
      if (!this.playing) this.destroy()
    }, DESTROY_TIMEOUT)
  }

  cancelDestroy () {
    if (typeof this.destroyTimeout === 'number') clearTimeout(this.destroyTimeout)
  }

  async destroy () {
    if (this.player) {
      await this.player.leave()
      await this.player.destroy()
    }
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
