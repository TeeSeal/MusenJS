const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util.js')

class PlayCommand extends Command {
  constructor() {
    super('list', {
      aliases: ['list', 'stations'],
      description: 'List ze stations',
    })
  }

  exec(msg) {
    const fields = this.client.radio.stations.map(station => {
      return [
        `${station.displayName} | ${station.provider.name}`,
        station.online ? '🔵 Online' : '🔴 Offline',
        true,
      ]
    })

    msg.util.send(buildEmbed({
      title: 'Station list',
      fields,
      color: 'scarlet',
    }))
  }
}

module.exports = PlayCommand