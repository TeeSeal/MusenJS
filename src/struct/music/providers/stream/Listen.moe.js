const MusicProvider = require('../../MusicProvider.js')

class ListenMoe extends MusicProvider {
  constructor () {
    super({ baseURL: 'https://listen.moe/api' })

    this.aliases = ['listenmoe', 'listen', 'lm']
    this.REGEXP = /listen\.moe/i
  }

  generatePlayable (opts) {
    return new MusicProvider.Playable(
      {
        id: 'listenmoe',
        title: 'Listen.Moe',
        thumbnail: 'https://pbs.twimg.com/profile_images/792630035832266752/mmry-djk_400x400.jpg',
        url: 'https://listen.moe',
        live: true,
        stream: 'async:https://listen.moe/stream'
      },
      this,
      opts
    )
  }

  async resolvePlayables (_, opts) {
    return [this.generatePlayable(opts)]
  }
}

module.exports = ListenMoe
