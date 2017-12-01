const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play', 'join', 'change', 'switch'],
      args: [
        {
          id: 'name',
          match: 'rest',
          type: 'lowercase',
        },
      ],
      description: 'Pley ze station',
    })
  }

  async exec(msg, args) {
    const { name } = args
    if (!msg.member.voiceChannel) return msg.util.error('gotta be in a voice channel.')
    const station = this.client.radio.findStation(name) || this.client.radio.stations.random()
    const connection = this.client.radio.connections.get(msg.guild.id) || await this.client.radio.connect(msg.member.voiceChannel)
    connection.play(station)
    return msg.util.send(station.embed())
  }
}

module.exports = PlayCommand
