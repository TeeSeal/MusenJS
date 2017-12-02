const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play', 'join'],
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

    const alreadyPlaying = this.client.radio.connections.has(msg.guild.id)
    if (!alreadyPlaying && !name) return msg.util.error('gotta name a station.')

    if (alreadyPlaying && msg.member.voiceChannel.id === msg.guild.me.voiceChannel.id) {
      return msg.util.error('I\'m already in your channel. Use `switch` to change stations.')
    }
    if (alreadyPlaying && msg.guild.me.voiceChannel.members.size > 1) {
      return msg.util.error('no can do. There are people listening in my current channel.')
    }

    const station = alreadyPlaying ? this.client.radio.connections.get(msg.guild.id).station : this.client.radio.findStation(name)
    if (!station) return msg.util.error('no such station.')
    if (!station.online) return msg.util.error(`the **${station.displayName}** station seems to be offline. Try refreshing it.`)

    const connection = await this.client.radio.connect(msg.member.voiceChannel, { volume: 0 })
    if (!alreadyPlaying) {
      connection.play(station).fadeVolume(25)
    }

    return msg.util.send(station.embed())
  }
}

module.exports = PlayCommand
