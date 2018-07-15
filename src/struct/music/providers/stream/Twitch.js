const MusicProvider = require('../../MusicProvider.js')

class Twitch extends MusicProvider {
  constructor () {
    super({
      baseURL: 'https://api.twitch.tv/helix/',
      headers: { 'Client-Id': process.env.TWITCH_CLIENT_ID }
    })

    this.aliases = ['twitch', 'tw']
    this.REGEXP = /(https?:\/\/)?(www\.)?twitch\.tv\//
  }

  generatePlayable (data, opts) {
    return new MusicProvider.Playable(
      {
        id: data.login,
        title: data.display_name,
        thumbnail: data.profile_image_url,
        url: `https://twitch.tv/${data.login}`,
        live: true
      },
      this,
      opts
    )
  }

  async fetchChannelData (login) {
    const { data: res } = await this.get('users', { params: { login } })
    if (res.data.length === 0) {
      return null
    }
    return res.data[0]
  }

  fetchStreamData (user_id) { // eslint-disable-line camelcase
    return this.get('streams', { params: { user_id } }).then(res => res.data.data[0])
  }

  async fetchStream (playable) {
    const channel = playable.id
    const { data: accessToken } = await this.get(
      `http://api.twitch.tv/api/channels/${channel}/access_token`
    )
    if (!accessToken) return null

    const { data: streams } = await this.get(
      `http://usher.twitch.tv/api/channel/hls/${channel}.m3u8`,
      {
        params: {
          player: 'twitchweb',
          token: accessToken.token,
          sig: accessToken.sig,
          allow_audio_only: true
        }
      }
    )
    if (!streams) return null

    return streams
      .split('\n')
      .filter(stream => stream)
      .pop()
  }

  async resolvePlayables (url, opts) {
    const channelName = this.REGEXP.test(url)
      ? Twitch.extractChannelName(url)
      : url

    const channelData = await this.fetchChannelData(channelName)
    if (!channelData) return null

    const streamData = await this.fetchStreamData(channelData.id)
    if (!streamData || streamData.type !== 'live') {
      return null
    }

    return [this.generatePlayable(channelData, opts)]
  }

  static extractChannelName (url) {
    return url.match(/twitch.tv\/(\w+)/)[1]
  }
}

module.exports = Twitch
