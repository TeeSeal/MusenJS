const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play'],
      description: 'Play ze station',
    })
  }

  async exec(msg) {
    const station = await this.client.radio.addStation('monstercat')
    const conn = await msg.member.voiceChannel.join()
    conn.playStream(station.stream)
  }
}

module.exports = PlayCommand
