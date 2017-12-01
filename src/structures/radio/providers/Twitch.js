const RadioProvider = require('../RadioProvider.js')
const moment = require('moment')
const M3U = require('playlist-parser').M3U

class Twitch extends RadioProvider {
  constructor(clientID, handler) {
    super({
      baseURL: 'https://api.twitch.tv/helix/',
      headers: { 'Client-Id': clientID },
    })

    this.handler = handler
    this.id = 'twitch'
    this.name = 'Twitch'
  }

  formatData(channelData, streamData, stream) {
    return {
      name: channelData.login,
      displayName: channelData.display_name,
      nowPlaying: streamData.title,
      startedAt: moment(streamData.started_at).format('HH:mm MMM D'),
      thumbnail: channelData.profile_image_url,
      stream,
      extra: {
        viewerCount: streamData.viewer_count,
        language: streamData.language,
      },
    }
  }

  async fetchChannelData(login) {
    const res = await this.get('users', { login })
    if (res.data.length === 0) return Promise.reject(new Error('Couldn\'t find channel.'))
    return res.data[0]
  }

  fetchStreamData(user_id) {
    return this.get('streams', { user_id }).then(res => res.data[0])
  }

  async fetchStream(channel) {
    const accessToken = await this.get(`http://api.twitch.tv/api/channels/${channel}/access_token`)
    if (!accessToken) return Promise.reject(new Error('Couldn\'t find channel.'))

    const streams = await this.get(`http://usher.twitch.tv/api/channel/hls/${channel}.m3u8`, {
      player: 'twitchweb',
      token: accessToken.token,
      sig: accessToken.sig,
      allow_audio_only: true,
    })
    if (!streams) return Promise.reject(new Error('Couldn\'t fetch stream.'))

    return M3U.parse(streams)
      .filter(stream => stream)
      .find(stream => stream.title.includes('audio_only')).file
  }

  async resolveStation(channel) {
    const channelData = await this.fetchChannelData(channel)
    const streamData = await this.fetchStreamData(channelData.id)
    const stream = await this.fetchStream(channel)

    return this.createStation(this.formatData(channelData, streamData, stream))
  }

  static get keychainKey() { return 'twitchClientID' }
}

module.exports = Twitch
