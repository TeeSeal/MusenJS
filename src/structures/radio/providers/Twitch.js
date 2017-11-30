const RadioProvider = require('../RadioProvider.js')
const M3U = require('playlist-parser').M3U

class Twitch extends RadioProvider {
  constructor(clientID) {
    super({
      baseURL: 'http://api.twitch.tv/api/',
      headers: { 'Client-Id': clientID },
    })

    this.id = 'twitch'
    this.aliases = ['twitch', 'tw']
  }

  async resolveStation(channel) {
    channel = channel.toLowerCase()
    const accessToken = await this.get(`channels/${channel}/access_token`)
    if (!accessToken) return null

    const streams = await this.get(`http://usher.twitch.tv/api/channel/hls/${channel}.m3u8`, {
      player: 'twitchweb',
      token: accessToken.token,
      sig: accessToken.sig,
      allow_audio_only: true,
    })
    if (!streams) return null

    const audioStream = M3U.parse(streams)
      .filter(stream => stream)
      .find(stream => stream.title.includes('audio_only')).file

    return this.createStation({ name: `twitch-${channel}`, stream: audioStream })
  }

  static get keychainKey() { return 'twitchClientID' }
}

module.exports = Twitch
