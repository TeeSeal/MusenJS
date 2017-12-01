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

    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')
    if (!station.online) return msg.util.error(`the **${station.displayName}** station seems to be offline. Try refreshing it.`)

    const connection = this.client.radio.connections.get(msg.guild.id) || await this.client.radio.connect(msg.member.voiceChannel, { volume: 0 })
    if (connection.dispatcher) await connection.fadeVolume(0)
    connection.play(station).fadeVolume(25)
    return msg.util.send(station.embed())
  }
}

module.exports = PlayCommand
