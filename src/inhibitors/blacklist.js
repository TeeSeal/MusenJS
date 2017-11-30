const { Inhibitor } = require('discord-akairo')
const { getDBData } = require('../util/Util.js')

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', { reason: 'blacklist' })
  }

  exec(msg) {
    if (msg.author.id === this.client.user.id) return false
    const scopes = msg.guild ? ['globally', 'guild', 'channel'] : ['globally']

    for (const scope of scopes) {
      const [table, id] = getDBData(msg, scope)

      if (this.client.db[table].get(id, 'blacklist').includes(msg.author.id)) return true
    }
    return false
  }
}

module.exports = BlacklistInhibitor
