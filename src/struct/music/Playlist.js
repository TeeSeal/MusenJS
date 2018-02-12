const { shuffle } = require('../../util')
const Embed = require('../MusenEmbed')

const embeds = {
  outOfSongs: new Embed()
    .addField('We\'re out of songs.', 'Better queue up some more!')
    .setIcon(Embed.icons.CLEAR)
    .setColor(Embed.colors.RED),

  playing(song, volume) {
    return new Embed()
      .setTitle(song.title)
      .setURL(song.url)
      .addField(
        'Now playing.',
        `Duration: ${song.durationString} | Volume: ${volume}%`
      )
      .setAuthor(song.member)
      .setIcon(Embed.icons.PLAY)
      .setColor(Embed.colors.GREEN)
  },

  skipping(song) {
    return new Embed()
      .setTitle(song.title)
      .setURL(song.url)
      .addField('An issue occured playing this song.', 'Skipping it.')
      .setAuthor(song.member)
      .setIcon(Embed.icons.SKIP)
      .setColor(Embed.colors.CYAN)
  },
}

class Playlist {
  constructor(msg, guildOptions, handler) {
    this.handler = handler
    this.id = msg.guild.id
    this.maxSongDuration = guildOptions.maxSongDuration * 60
    this.songLimit = guildOptions.songLimit
    this.queue = []
    this.channel = msg.channel
    this.voiceChannel = msg.member.voiceChannel
    this.song = null
    this.connection = null
    this.defaultVolume = this.convert(guildOptions.defaultVolume) || 0.5
    this._volume = this.defaultVolume
    this.paused = false
  }

  async connectAndPlay() {
    this.connection = await this.voiceChannel.join()
    this.play(this.queue.shift())
  }

  filter(songs) {
    const removed = []
    const filtered = songs.filter(song => {
      if (song.member.id === song.member.client.ownerID) return true

      if (song.duration > this.maxSongDuration * 6e4) {
        removed.push({
          song,
          reason: `duration. (max. **${this.maxSongDuration / 60}** min.)`,
        })
        return false
      }

      return true
    })

    const diff = this.queue.length + filtered.length - this.songLimit
    if (diff > 0) {
      for (const song of filtered.splice(filtered.length - diff, diff)) {
        removed.push({
          song,
          reason: `playlist song limit reached. (max. **${
            this.songLimit
          }** songs)`,
        })
      }
    }

    return [filtered, removed]
  }

  async play(song) {
    if (!song) {
      this.channel.send(embeds.outOfSongs)
      return this.destroy()
    }

    this.song = song
    this._volume = this.convert(song.volume) || this.defaultVolume
    this.channel.send(embeds.playing(song, this.volume))

    const dispatcher = await song.play(this.connection, {
      volume: this._volume,
    })

    if (!dispatcher) {
      this.channel.send(embeds.skipping(song))
      return setTimeout(() => this.play(this.queue.shift()), 10)
    }

    dispatcher.on('end', reason => {
      if (reason === 'stop') return this.destroy()
      return setTimeout(() => this.play(this.queue.shift()), 10)
    })
  }

  add(songs) {
    const [added, removed] = this.filter(songs)
    this.queue.push(...added)

    if (!this.song) {
      if (added.length === 0) this.destroy()
      else this.connectAndPlay()
    }

    return [added, removed]
  }

  shuffle() {
    shuffle(this.queue)
  }

  pause() {
    this.song.dispatcher.pause()
    this.paused = true
  }

  resume() {
    this.song.dispatcher.resume()
    this.paused = false
  }

  setVolume(volume) {
    this._volume = this.convert(volume)
    this.song.dispatcher.setVolume(this._volume)
  }

  fadeVolume(volume) {
    let current = this._volume
    this._volume = this.convert(volume)
    const modifier = current < this._volume ? 0.05 : -0.05

    return new Promise(resolve => {
      const interval = setInterval(() => {
        current += modifier
        this.song.dispatcher.setVolume(current)

        if (current > this._volume - 0.05 && current < this._volume + 0.05) {
          this.song.dispatcher.setVolume(this._volume)
          clearInterval(interval)
          setTimeout(resolve, 800)
        }
      }, 35)
    })
  }

  async skip() {
    await this.fadeVolume(0)
    this.song.dispatcher.end('skip')
  }

  stop() {
    this.queue = []
    this.song.dispatcher.end('stop')
  }

  destroy() {
    this.voiceChannel.leave()
    this.handler.playlists.delete(this.id)
  }

  convert(volume) {
    return volume / 50
  }
  get volume() {
    return this._volume * 50
  }
}

module.exports = Playlist
