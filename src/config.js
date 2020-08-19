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
  },
  db: {
    name: process.env.DB_NAME || 'musen',
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'musen',
    password: process.env.DB_PASSWORD || '123456'
  }
}
