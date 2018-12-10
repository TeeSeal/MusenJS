const { CommandUtil } = require('discord-akairo')
const MusenClient = require('./struct/MusenClient')
const client = new MusenClient()

client.init()
process.on('unhandledRejection', err => client.logError(err))

Object.assign(CommandUtil.prototype, {
  info (content, opts) {
    const name = this.message.member
      ? this.message.member.displayName
      : this.message.author.username
    return this.send(`**${name}** | ${content}`, opts)
  },

  success (content, opts) {
    return this.info(`✅ ${content}`, opts)
  },
  error (content, opts) {
    return this.info(`❌ ${content}`, opts)
  }
})
