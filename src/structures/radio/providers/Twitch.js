const RadioProvider = require('../RadioProvider.js')
const moment = require('moment')
const { capitalize } = require('../../../util/Util.js')
const M3U = require('playlist-parser').M3U

class Twitch extends RadioProvider {
  constructor(clientID) {
    super({
      baseURL: 'https://api.twitch.tv/helix/',
      headers: { 'Client-Id': clientID },
    })

    this.id = 'twitch'
    this.aliases = ['twitch', 'tw']
  }

  formatData(data) {
    const thumbnail = data.thumbnail_url.replace(/\{width\}|\{height\}/, '500')
    return {
      name: data.name,
      title: data.title,
      startedAt: moment(data.started_at).isValid(),
      thumbnail,
      stream: data.stream,
      extra: {
        viewerCount: data.viewer_count,
        language: data.language,
      },
    }
  }

  async fetchChannelID(login) {
    const res = await this.get('users', { login })
    if (res.data.length === 0) return Promise.reject(new Error('couldn\'t find channel.'))
    return res.data[0].id
  }

  fetchStreamData(channel) {
    return this.fetchChannelID(channel)
      .then(user_id => this.get('streams', { user_id }))
      .then(res => res.data[0])
  }

  async fetchStream(channel) {
    const accessToken = await this.get(`http://api.twitch.tv/api/channels/${channel}/access_token`)
    if (!accessToken) return Promise.reject(new Error('couldn\'t find channel.'))

    const streams = await this.get(`http://usher.twitch.tv/api/channel/hls/${channel}.m3u8`, {
      player: 'twitchweb',
      token: accessToken.token,
      sig: accessToken.sig,
      allow_audio_only: true,
    })
    if (!streams) return Promise.reject(new Error('couldn\'t fetch stream.'))

    return M3U.parse(streams)
      .filter(stream => stream)
      .find(stream => stream.title.includes('audio_only')).file
  }

  async resolveStation(channel) {
    const data = await this.fetchStreamData(channel)
    if (data.type !== 'live') return Promise.reject(new Error('station is not live.'))
    data.stream = await this.fetchStream(channel)
    data.name = capitalize(channel)

    return this.createStation(this.formatData(data))
  }

  static get keychainKey() { return 'twitchClientID' }
}

module.exports = Twitch
