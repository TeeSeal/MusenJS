const { Command } = require('discord-akairo')

class InviteCommand extends Command {
  constructor() {
    super('invite', {
      aliases: ['invite', 'inv'],
      description: 'Get this bot\'s invite link.',
    })
  }

  exec(msg) {
    return msg.channel.send('https://discordapp.com/api/oauth2/authorize?client_id=385824972435881994&permissions=36980800&scope=bot')
  }
}

module.exports = InviteCommand
