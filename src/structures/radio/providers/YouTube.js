const RadioProvider = require('../RadioProvider.js')
const moment = require('moment')
const ytdl = require('ytdl-core')

class YouTube extends RadioProvider {
  constructor(handler, key) {
    super({
      baseURL: 'https://www.googleapis.com/youtube/v3/',
      params: { key },
    })

    this.id = 'youtube'
    this.name = 'YouTube'
    this.handler = handler
  }

  formatOnlineStation(channelData, streamData, stream) {
    return {
      id: channelData.id,
      name: channelData.snippet.title,
      thumbnail: channelData.snippet.thumbnails.high.url,
      nowPlaying: streamData.snippet.title,
      url: `http://youtube.com/watch?v=${streamData.id}/`,
      online: true,
      stream: stream,
      extra: {
        startedAt: moment(streamData.started_at).format('HH:mm MMM D'),
        viewerCount: streamData.viewer_count,
      },
    }
  }

  formatOfflineStation(channelData) {
    return {
      id: channelData.id,
      name: channelData.snippet.title,
      thumbnail: channelData.snippet.thumbnails.high.url,
    }
  }

  fetchChannelData(id) {
    return this.get('channels', {
      id,
      part: 'snippet',
      fields: 'items(id, snippet(title, thumbnails(high)))',
    }).then(res => res.items[0])
  }

  findChannelIDByName(q) {
    return this.get('search', {
      q,
      part: 'id',
      type: 'channel',
    }).then(res => res.items[0] ? res.items[0].id.channelId : null)
  }

  findLatestStreamID(channelId) {
    return this.get('search', {
      channelId,
      order: 'date',
      part: 'id',
      eventType: 'live',
      type: 'video',
    }).then(res => res.items[0] ? res.items[0].id.videoId : null)
  }

  fetchVideoData(id) {
    return this.get(`videos`, {
      id,
      fields: 'items(id, snippet(channelId, title, liveBroadcastContent), liveStreamingDetails(actualStartTime, concurrentViewers))',
      part: 'snippet,liveStreamingDetails',
    }).then(res => res.items[0])
  }

  async resolveStation(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      if (!query.includes('channel')) return this.resolveStationFromVideo(query)
      query = query.split('/').slice(-1)[0]
    }

    if (!/^[a-zA-Z0-9-_]{24}$/.test(query)) query = await this.findChannelIDByName(query)
    if (!query) return null

    const channelData = await this.fetchChannelData(query)
    const latestStreamID = await this.findLatestStreamID(query)
    if (!latestStreamID) return this.createStation(this.formatOfflineStation(channelData))

    const streamData = await this.fetchVideoData(latestStreamID)
    const stream = ytdl(streamData.id)
    return this.createStation(this.formatOnlineStation(channelData, streamData, stream))
  }

  async resolveStationFromVideo(query) {
    const videoID = YouTube.extractVideoID(query)
    const streamData = await this.fetchVideoData(videoID)
    const channelData = await this.fetchChannelData(streamData.snippet.channelId)
    const stream = ytdl(streamData.id)
    return this.createStation(this.formatOnlineStation(channelData, streamData, stream))
  }

  static extractVideoID(url) {
    return url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/)[2]
  }

  static get keychainKey() { return 'googleAPIKey' }
}

module.exports = YouTube
