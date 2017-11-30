const { Listener } = require('discord-akairo')
const { stripIndents } = require('../util/Util.js')
const logr = require('logr')

class ErrorListener extends Listener {
  constructor() {
    super('error', {
      emitter: 'commandHandler',
      event: 'error',
    })
  }

  exec(err, msg, cmd) {
    logr.error(err)

    const owner = this.client.users.get(this.client.akairoOptions.ownerID)
    if (!owner) return

    owner.send(stripIndents`
      Errored when trying to run \`${cmd.id}\` in ${msg.channel}.
      Called by ${msg.author} with the content:
      \`\`\`
      ${msg.content}
      \`\`\`
      ERROR:
      \`\`\`
      ${err.stack}
      \`\`\`
    `)
  }
}

module.exports = ErrorListener
