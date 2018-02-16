const { Listener } = require('discord-akairo')
const logr = require('logr')

class CommandFinishedListener extends Listener {
  constructor() {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    })
  }

  exec(msg, cmd) {
    let str = `${msg.author.tag} > ${cmd.id}`
    if (msg.guild) str = `${msg.guild.name} :: ${msg.channel.name} :: ${str}`
    logr.info(str)
  }
}

module.exports = CommandFinishedListener
