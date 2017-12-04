const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util.js')

class ListCommand extends Command {
  constructor() {
    super('list', {
      aliases: ['list', 'stations'],
      description: 'List all stations.',
      args: [
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: word => {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            if (num < 1) return null
            return num
          },
          default: 1,
        },
      ],
    })
  }

  exec(msg, args) {
    const { page } = args
    const items = this.client.radio.stations.map(station => {
      return [
        `${station.name} | ${station.provider.name}\t`,
        [station.online ? '🔵' : '🔴', `Listeners: **${station.listenerCount}**`].join(' | '),
        true,
      ]
    })

    if (items.length === 0) return msg.util.error('there aren\'t any stations yet :(')

    msg.util.send(buildEmbed({
      title: 'Station list',
      paginate: {
        items,
        page,
        commandName: this.id,
      },
      color: 'scarlet',
    }))
  }
}

module.exports = ListCommand
