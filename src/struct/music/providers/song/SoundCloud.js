const MusicProvider = require('../../MusicProvider')

class SoundCloud extends MusicProvider {
  constructor() {
    super({
      baseURL: 'https://api.soundcloud.com/',
      params: { client_id: process.env.SOUNDCLOUD_CLIENT_ID }
    })

    this.clientID = process.env.SOUNDCLOUD_CLIENT_ID
    this.aliases = ['soundcloud', 'sc']
    this.REGEXP = /^https:\/\/soundcloud\.com\//
  }

  generatePlayable(track, opts) {
    return new MusicProvider.Playable(
      {
        id: track.id,
        title: track.title,
        thumbnail: track.artwork_url,
        stream: `${track.stream_url}?client_id=${this.clientID}`,
        duration: track.duration,
        url: track.permalink_url
      },
      opts
    )
  }

  async fetchFromURL(url) {
    const { data: resource } = await this.get('resolve.json', {
      params: { url }
    })

    if (!(resource && ['track', 'playlist'].includes(resource.kind))) {
      return null
    }

    return resource.kind === 'track' ? [resource] : resource.tracks
  }

  async search(query) {
    const { data: [track] } = await this.get('tracks', { params: { q: query } })
    if (!track) return null
    return [track]
  }

  async resolvePlayables(query, opts) {
    const tracks = this.REGEXP.test(query)
      ? await this.fetchFromURL(query)
      : await this.search(query)

    if (!tracks) return null

    return tracks.map(track => this.generatePlayable(track, opts))
  }
}

module.exports = SoundCloud
