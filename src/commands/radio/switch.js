const { Command } = require('discord-akairo')

class SwitchCommand extends Command {
  constructor() {
    super('switch', {
      aliases: ['switch', 'change'],
      args: [
        {
          id: 'name',
          match: 'rest',
          type: 'lowercase',
        },
      ],
      description: 'Switch to another station.',
    })
  }

  async exec(msg, args) {
    const { name } = args
    if (!msg.member.voiceChannel) return msg.util.error('gotta be in a voice channel.')
    if (!name) return msg.util.error('what station do you want to switch to?')

    const alreadyPlaying = this.client.radio.connections.has(msg.guild.id)
    if (!alreadyPlaying) return msg.util.error('there\'s nothing currently playing.')

    const station = this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')
    if (!station.online) return msg.util.error(`the **${station.name}** station seems to be offline. Try refreshing it.`)

    const connection = this.client.radio.connections.get(msg.guild.id)
    if (connection.dispatcher) await connection.fadeVolume(0)

    const refreshed = await station.refresh()
    connection.play(refreshed).fadeVolume(25)
    return msg.util.send(refreshed.embed())
  }
}

module.exports = SwitchCommand
