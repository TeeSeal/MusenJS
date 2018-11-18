const { Command } = require('discord-akairo')

class InviteCommand extends Command {
  constructor () {
    super('invite', {
      aliases: ['invite', 'inv'],
      description: 'Get this bot\'s invite link.'
    })
  }

  exec (msg) {
    return msg.channel.send(
      `https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=37080128`
    )
  }
}

module.exports = InviteCommand
