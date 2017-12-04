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
        {
          id: 'volume',
          match: 'prefix',
          prefix: ['v=', 'vol=', 'volume='],
          type(word, msg) {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            const { maxVolume } = this.client.db.guilds.get(msg.guild.id)
            if (num < 1) return 1
            if (num > maxVolume) return maxVolume
            return num
          },
        },
      ],
      description: 'Pley a station.',
    })
  }

  async exec(msg, args) {
    const { name } = args
    const volume = args.volume || this.client.db.guilds.get(msg.guild.id).defaultVolume

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

    await station.refresh()
    const connection = sameChannel && alreadyPlaying
      ? this.client.radio.connections.get(msg.guild.id)
      : await this.client.radio.connect(msg.member.voiceChannel, { volume })

    if (!sameStation) connection.play(station)
    return msg.util.send(station.embed())
  }
}

module.exports = PlayCommand
