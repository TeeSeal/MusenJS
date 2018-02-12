const { Inhibitor } = require('discord-akairo')
const { getDBData } = require('../util')
const db = require('../db')

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', { reason: 'blacklist' })
  }

  exec(msg) {
    if (msg.author.id === this.client.user.id) return false
    const scopes = ['globally']
    if (msg.guild) scopes.push('guild', 'channel')

    for (const scope of scopes) {
      const { modelName, id } = getDBData(msg, scope)
      const model = db[modelName]
      const disabled
        = modelName === 'Setting'
          ? model.get('blacklist')
          : model.get(id, 'blacklist')

      if (disabled.includes(msg.author.id)) {
        return true
      }
    }

    return false
  }
}

module.exports = BlacklistInhibitor
