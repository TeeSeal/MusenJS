const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play'],
      description: 'Play ze station',
    })
  }

  exec(msg) {
    return this.client.radio.addStation('monstercat').then(async station => {
      const conn = await msg.member.voiceChannel.join()
      conn.playStream(station.stream)
    }).catch(err => msg.util.error(err.message))
  }
}

module.exports = PlayCommand
