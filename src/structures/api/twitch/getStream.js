const M3U = require('playlist-parser').M3U
const ffmpeg = require('fluent-ffmpeg')
const axios = require('axios').create({
  headers: {
    'Client-Id': 'deztsvjg5tbthco7a2vlla8m2085d7'
  },
  baseURL: 'http://api.twitch.tv/api/'
})

async function getStream() {
  const accessToken = await axios.get('channels/monstercat/access_token').then(res => res.data)
  const playlist = await axios.get('http://usher.twitch.tv/api/channel/hls/monstercat.m3u8', {
    params: {
      player: 'twitchweb',
      token: accessToken.token,
      sig: accessToken.sig,
      allow_audio_only: true,
      type: 'any',
    }
  }).then(res => res.data)

  const data = M3U.parse(playlist)
  const file = data
    .filter(stream => stream)
    .find(stream => stream.title.includes('audio_only')).file

  return file
}

module.exports = getStream
