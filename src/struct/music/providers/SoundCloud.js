const MusicProvider = require('../MusicProvider')

class SoundCloud extends MusicProvider {
  constructor(clientID) {
    super({
      baseURL: 'https://api.soundcloud.com/',
      params: { client_id: process.env.SOUNDCLOUD_CLIENT_ID },
    })

    this.clientID = clientID
    this.aliases = ['soundcloud', 'sc']
    this.REGEXP = /^https:\/\/soundcloud\.com\//
  }

  formatSong(track) {
    return {
      id: track.id,
      title: track.title,
      thumbnail: track.artwork_url,
      stream: `${track.stream_url}?client_id=${this.clientID}`,
      duration: track.duration,
      url: track.permalink_url,
    }
  }

  async findResource(url) {
    return this.get('resolve.json', { url })
  }

  async resolveResource(query) {
    if (this.REGEXP.test(query)) {
      const resource = await this.findResource(query)

      if (!resource) return null
      if (!['track', 'playlist'].some(kind => resource.kind === kind)) {
        return null
      }

      return resource.kind === 'track'
        ? [this.formatSong(resource)]
        : resource.tracks.map(track => this.formatSong(track))
    }

    const track = await this.get('tracks', { q: query }).then(res => res[0])
    if (!track) return null

    return [this.formatSong(track)]
  }

  static get keychainKey() {
    return 'soundCloudClientID'
  }
}

module.exports = SoundCloud
