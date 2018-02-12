const { Command } = require('discord-akairo')
const { stripIndents, shuffle, parserInRange } = require('../../util')
const { Guild } = require('../../db')
const Embed = require('../../struct/MusenEmbed')
const Music = require('../../struct/music')

class PlayCommand extends Command {
  constructor() {
    super('play', {
      aliases: ['play', 'yt'],
      channelRestriction: 'guild',
      editable: false,
      // typing: true,
      args: [
        {
          id: 'rand',
          match: 'flag',
          prefix: '-shuffle',
        },
        {
          id: 'queries',
          match: 'rest',
          type: line => line.split(';').map(q => q.trim()),
          default: [],
        },
        {
          id: 'volume',
          match: 'prefix',
          prefix: ['volume=', 'vol=', 'v='],
          type(word, msg) {
            const parse = parserInRange(0, Guild.get(msg.guild.id).maxVolume)
            return parse(word)
          },
        },
      ],
      description: stripIndents`
        Play some music.
        **Mandatory arguments:**
        \`query\` - something to use as a source.

        **Optional arguments:**
        \`volume\` - play the song(s) at the given volume rather than the default one.

        **Optional flags:**
        \`-shuffle\` - shuffle the songs before adding to playlist.

        **Usage:**
        \`play something\` => searches youtube for 'something' and adds the first result to the queue.
        \`play one two vol=35\` => searches youtube for 'one two' and adds the first result to the queue with the volume at 35%.

        **A query can be:**
        - Link to the YouTube/SoundCloud resource. (song or playlist)
        - Simple search query.

        **NOTE:**
        Search queries will default to YouTube.
        To specify a provider to search on use \`~<PROVIDER_NAME>\` anywhere in your query.
        Example: \`play otter pop ~soundcloud\` => will search for \`otter pop\` on soundcloud.

        You may also input multiple queries in a single command by separating them with \`;\`.
        Example: \`play <YOUTUBE_VIDEO>; <SOUNDCLOUD_PLAYLIST>; some search query; other search query ~soundcloud\`
      `,
    })
  }

  async exec(msg, { queries, rand, volume }) {
    if (queries.length === 0) {
      return msg.util.error('give me something to look for, yo..')
    }
    if (!msg.member.voiceChannel) {
      return msg.util.error('you need to be in a voice channel.')
    }
    if (
      msg.guild.me.voiceChannel
      && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id
    ) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    const guildOptions = Guild.get(msg.guild.id)
    const playlist = Music.getPlaylist(msg, guildOptions)

    const songs = await Music.resolveSongs(queries, {
      member: msg.member,
      volume,
    })
    if (!songs) return msg.util.error('couldn\'t find resource.')
    if (rand) shuffle(songs)

    const [added, removed] = playlist.add(songs)

    if (removed.length) {
      const items = removed.map(
        obj => `• ${obj.song.linkString}\n**Reason:** ${obj.reason}`
      )

      await new Embed(msg.channel)
        .setTitle('Failed to add:')
        .setDescription(items)
        .setAuthor(msg.member)
        .setIcon(Embed.icons.CLEAR)
        .setColor(Embed.colors.RED)
        .send()
    }

    if (added.length === 0) {
      return msg.util.error('nothing was added to the playlist.')
    }

    const items = added.map(song => `• ${song.linkString}`)

    const embed = new Embed(msg.channel)
      .setTitle('Added to playlist:')
      .setDescription(items)
      .setAuthor(msg.member)
      .setIcon(Embed.icons.PLAYLIST_ADD)
      .setColor(Embed.colors.BLUE)

    if (added.length === 1) embed.setImage(added[0].thumbnail)

    return embed.send()
  }
}

module.exports = PlayCommand
