const { Inhibitor } = require('discord-akairo')
const { getDBData } = require('../util')
const db = require('../db')

class DisabledInhibitor extends Inhibitor {
  constructor () {
    super('disabled', { reason: 'disabled' })
  }

  exec (msg, command) {
    if (msg.author.id === this.client.user.id) return false
    const scopes = ['globally']
    if (msg.guild) scopes.push('guild', 'channel')

    for (const scope of scopes) {
      const { modelName, formattedScope, id } = getDBData(msg, scope)
      const model = db[modelName]
      const disabled =
        modelName === 'Setting'
          ? model.get('disabled')
          : model.get(id, 'disabled')

      if (disabled.includes(command.id)) {
        msg.util.error(
          `**${command.id}** is disabled ${formattedScope}.`
        )
        return true
      }
    }

    return false
  }
}

module.exports = DisabledInhibitor
