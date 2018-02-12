const MusicProvider = require('../MusicProvider')
const moment = require('moment')
const ytdl = require('ytdl-core')

class YouTube extends MusicProvider {
  constructor() {
    super({
      baseURL: 'https://www.googleapis.com/youtube/v3/',
      params: { key: process.env.GOOGLE_API_KEY },
    })

    this.aliases = ['youtube', 'yt', 'tube']
    this.REGEXP = /(https?:\/\/)?(www\.)?youtu(be\.com|\.be)\//
  }

  formatSong(video) {
    const duration = moment
      .duration(video.contentDetails.duration)
      .asMilliseconds()
    const url = `https://www.youtube.com/watch?v=${video.id}`
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.maxres
        ? video.snippet.thumbnails.maxres.url
        : video.snippet.thumbnails.high.url,
      duration,
      url,

      fetchStream() {
        if (this.stream) return this.stream
        return new Promise(resolve => {
          const stream = ytdl(this.url, { filter: 'audioonly' })
            .once('response', () => {
              this.stream = stream
              stream.removeAllListeners('error')
              resolve(stream)
            })
            .once('error', () => {
              this.stream = null
              stream.removeAllListeners('response')
              resolve(null)
            })
        })
      },
    }
  }

  getByID(id) {
    return this.get('videos', {
      params: {
        id,
        fields:
          'items(id,snippet(title,thumbnails(maxres(url),high(url))),contentDetails(duration))',
        part: 'snippet,contentDetails',
      }
    })
  }

  getPlaylistItems(playlistId) {
    return this.get('playlistItems', {
      params: {
        playlistId,
        maxResults: 50,
        fields: 'items(contentDetails(videoId))',
        part: 'contentDetails',
      }
    })
  }

  search(query) {
    return this.get('search', {
      params: {
        q: query,
        maxResults: 1,
        part: 'id',
        type: 'video',
      }
    })
  }

  async resolveVideo(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      query = YouTube.extractVideoID(query)
    }

    if (!/^[a-zA-Z0-9-_]{11}$/.test(query)) {
      const { data: { items } } = await this.search(query)
      query = items.length ? items[0].id.videoId : null
    }
    if (!query) return null

    const { data: { items: [video] } } = await this.getByID(query)
    return [this.formatSong(video)]
  }

  async resolvePlaylist(query) {
    if (query.includes('/playlist?')) {
      query = YouTube.extractPlaylistID(query)
    }

    const { data: { items: playlistItems } } = await this.getPlaylistItems(query)
    if (!playlistItems) return null

    const id = playlistItems.map(video => video.contentDetails.videoId).join()
    const { data: { items: videos } } = await this.getByID(id)

    return videos.map(this.formatSong)
  }

  async resolveResource(query) {
    if (query.includes('/playlist?') || /^[a-zA-Z0-9-_]{12,}$/.test(query)) {
      const result = await this.resolvePlaylist(query)
      if (result) return result
    }

    return this.resolveVideo(query)
  }

  static extractVideoID(url) {
    return url.match(
      /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/
    )[2]
  }

  static extractPlaylistID(url) {
    return url.match(/list=([\w\-_]+)/)[1]
  }

  static get keychainKey() {
    return 'googleAPIKey'
  }
}

module.exports = YouTube
