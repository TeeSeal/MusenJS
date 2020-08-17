module.exports = {
  prefix: '>>',
  ownerID: '117270616595365890',
  pageItemCount: 10,
  defaultMusicProvider: 'youtube',
  embed: {
    textLimit: 1000,
    fieldLimit: 10
  },
  lavalink: {
    host: process.env.LAVALINK_HOST || 'localhost',
    port: process.env.LAVALINK_PORT || 2333,
    password: process.env.LAVALINK_PASSWORD || 'password'
  }
}
