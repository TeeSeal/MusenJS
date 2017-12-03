const RadioProvider = require('../RadioProvider.js')
const ytdl = require('ytdl-core')

class YouTube extends RadioProvider {
  constructor(key, handler) {
    super({
      baseURL: 'https://www.googleapis.com/youtube/v3/',
      defaultParams: { key },
    })

    this.id = 'youtube'
    this.name = 'YouTube'
    this.handler = handler
    this.REGEXP = /(https?:\/\/)?(www\.)?youtu(be\.com|\.be)\//
  }

  formatStation(video) {
    const url = `https://www.youtube.com/watch?v=${video.id}`
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.maxres
        ? video.snippet.thumbnails.maxres.url
        : video.snippet.thumbnails.high.url,
      url,
    }
  }

  getByID(id) {
    return this.get(`videos`, {
      id,
      fields: 'items(id, snippet(title, thumbnails(maxres(url), high(url))), contentDetails(duration))',
      part: 'snippet,contentDetails',
    })
  }

  search(query) {
    return this.get('search', {
      q: query,
      maxResults: 1,
      part: 'id',
      type: 'video',
    })
  }

  async resolveStation(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      query = YouTube.extractVideoID(query)
    }

    if (!/^[a-zA-Z0-9-_]{11}$/.test(query)) {
      query = await this.search(query)
        .then(res => res.items[0] ? res.items[0].id.videoId : null)
    }
    if (!query) return null

    console.log(query)
    const video = await this.getByID(query)
    console.log(video)
    return this.createStation(this.formatStation(video))
  }

  static attachStream(song) {
    return new Promise(resolve => {
      const stream = ytdl(song.url, { filter: 'audioonly' })
        .once('response', () => {
          song.stream = stream
          stream.removeAllListeners('error')
          resolve(song)
        })
        .once('error', () => {
          song.stream = null
          stream.removeAllListeners('response')
          resolve(song)
        })
    })
  }

  static extractVideoID(url) {
    return url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/)[2]
  }

  static extractPlaylistID(url) {
    return url.match(/list=([\w\-_]+)/)[1]
  }

  static get keychainKey() { return 'googleAPIKey' }
}

module.exports = YouTube
