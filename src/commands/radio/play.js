const { Command } = require('discord-akairo')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play', 'join', 'switch', 'change'],
      typing: true,
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
    const sameChannel = msg.guild.me.voiceChannel
      ? msg.guild.me.voiceChannel.id === msg.member.voiceChannel.id
      : false

    if (!alreadyPlaying && !name) return msg.util.error('gotta name a station.')
    if (alreadyPlaying && msg.guild.me.voiceChannel.members.size > 1 && !sameChannel) {
      return msg.util.error('no can do. There are people listening in my current channel.')
    }

    const station = name
      ? this.client.radio.findStation(name)
      : this.client.radio.connections.get(msg.guild.id).station

    if (!station) return msg.util.error('no such station.')
    if (!station.online) return msg.util.error(`the **${station.name}** station seems to be offline. Try refreshing it.`)

    const sameStation = alreadyPlaying
      ? station.id === this.client.radio.connections.get(msg.guild.id).station.id
      : false

    if (sameChannel && sameStation) return msg.util.error(`I'm already playing **${station.name}** in your voice channel.`)

    const refreshed = await station.refresh()
    const connection = sameChannel && alreadyPlaying
      ? this.client.radio.connections.get(msg.guild.id)
      : await this.client.radio.connect(msg.member.voiceChannel, { volume: 0 })

    if (sameStation) connection.station = refreshed
    else connection.play(refreshed).fadeVolume(25)

    return msg.util.send(refreshed.embed())
  }
}

module.exports = PlayCommand
