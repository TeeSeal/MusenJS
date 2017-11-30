const { Inhibitor } = require('discord-akairo')
const { getDBData } = require('../util/Util.js')

class DisabledInhibitor extends Inhibitor {
  constructor() {
    super('disabled', { reason: 'disabled' })
  }

  exec(msg) {
    const scopes = msg.guild ? ['globally', 'guild', 'channel'] : ['globally']

    for (const scope of scopes) {
      const [table, id, formattedScope] = getDBData(msg, scope)

      if (this.client.db[table].get(id, 'disabled').includes(msg.util.command.id)) {
        msg.util.error(`**${msg.util.command.id}** is disabled ${formattedScope}.`)
        return true
      }
    }
    return false
  }
}

module.exports = DisabledInhibitor
