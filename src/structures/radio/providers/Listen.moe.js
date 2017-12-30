const RadioProvider = require('../RadioProvider.js')
const WebSocket = require('ws')

class ListenMoe extends RadioProvider {
  constructor(handler) {
    super({ baseURL: 'https://listen.moe/api' })
    this.ws = null
    this.lastMessage = null

    this.handler = handler
    this.id = 'listenmoe'
    this.name = 'Listen.moe'
  }

  formatStream(data) {
    return {
      id: this.id,
      name: this.name,
      nowPlaying: [data.artist_name, data.song_name].join(' - '),
      thumbnail: 'https://a.safe.moe/B2q07.png',
      url: `https://listen.moe/`,
      online: true,
      stream: 'async:https://listen.moe/stream',
      extra: { viewerCount: data.listeners },
    }
  }

  initWebSocket() {
    return new Promise(resolve => {
      const ws = new WebSocket('https://listen.moe/api/v2/socket')
      ws.once('open', () => {
        this.ws = ws
      })
      ws.on('message', data => {
        if (!data) return
        const firstMessage = !this.lastMessage
        this.lastMessage = JSON.parse(data)
        if (!firstMessage) this.handler.stations.get(this.id).refresh()
        resolve()
      })
    })
  }

  async resolveStation() {
    if (!this.lastMessage) await this.initWebSocket()
    return this.createStation(this.formatStream(this.lastMessage))
  }
}

module.exports = ListenMoe
