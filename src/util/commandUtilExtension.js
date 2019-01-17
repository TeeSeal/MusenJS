const { CommandUtil } = require('discord-akairo')

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
