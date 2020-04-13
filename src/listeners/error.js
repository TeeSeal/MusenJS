const { Listener } = require('discord-akairo')
const { stripIndents } = require('../util')
const logr = require('logr')

class ErrorListener extends Listener {
  constructor () {
    super('error', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec (err, msg, cmd) {
    logr.error(err)

    const owner = await this.client.users.fetch(this.client.options.ownerID)
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
