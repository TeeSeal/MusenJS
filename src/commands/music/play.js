const { Command, Argument } = require('discord-akairo')
const { stripIndents, shuffle } = require('../../util')
const { Guild } = require('../../db')
const Embed = require('../../struct/MusenEmbed')

class PlayCommand extends Command {
  constructor () {
    super('play', {
      aliases: ['play', 'yt'],
      channelRestriction: 'guild',
      editable: false,
      // typing: true,
      args: [
        {
          id: 'rand',
          match: 'flag',
          flag: '--shuffle'
        },
        {
          id: 'queries',
          match: 'rest',
          type: (_, line) => line.split(';').map(q => q.trim()),
          default: []
        },
        {
          id: 'volume',
          match: 'option',
          flag: ['--volume', '--vol', '-v'],
          type (msg, word) {
            return Argument
              .range('integer', 0, Guild.get(msg.guild.id).maxVolume, true)
              .bind(this)(msg, word)
          },
          default: msg => Guild.get(msg.guild.id).defaultVolume
        }
      ],
      description: stripIndents`
        Play some music.
        **Mandatory arguments:**
        \`query\` - something to use as a source.

        **Optional arguments:**
        \`--volume\` - play the track(s) at the given volume rather than the default one.

        **Optional flags:**
        \`--shuffle\` - shuffle the tracks before adding to playlist.

        **Usage:**
        \`play something\` => searches youtube for 'something' and adds the first result to the queue.
        \`play one two vol=35\` => searches youtube for 'one two' and adds the first result to the queue with the volume at 35%.

        **A query can be:**
        - Link to the YouTube/SoundCloud resource. (track or playlist)
        - Simple search query.
      `
    })
  }

  async exec (msg, { queries, rand, volume }) {
    if (queries.length === 0) {
      return msg.util.error('give me something to look for.')
    }

    if (!msg.member.voice.channel) {
      return msg.util.error('you need to be in a voice channel.')
    }

    const guildOptions = Guild.get(msg.guild.id)
    const playlist = this.client.music.getOrCreatePlaylist(msg.guild.id, guildOptions)

    if (playlist.started && msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    const tracks = await this.client.music.resolveTracks(queries, {
      member: msg.member,
      volume
    })

    if (!tracks) return msg.util.error('couldn\'t find resource.')
    if (rand) shuffle(tracks)
    const { added, removed } = playlist.add(tracks)

    if (removed.length) {
      const items = removed.map(
        ({ track, reason }) =>
          `• ${track.formattedTitle}\n**Reason:** ${reason}`
      )

      await new Embed(msg.channel)
        .setTitle('Failed to add:')
        .setDescription(items)
        .setAuthor(msg.member)
        .setIcon(Embed.icons.CLEAR)
        .setColor(Embed.colors.RED)
        .send()
    }

    if (!added.length) {
      if (!playlist.started) playlist.destroy()
      return msg.util.error('nothing was added to the playlist.')
    }

    const embed = new Embed(msg.channel)
      .setTitle('Added to playlist:')
      .setDescription(added.map(track => `• ${track.formattedTitle}`))
      .setAuthor(msg.member)
      .setIcon(Embed.icons.PLAYLIST_ADD)
      .setColor(Embed.colors.BLUE)

    await embed.send()

    if (!playlist.started) {
      this.attachEventHandlers(playlist, msg.channel)
      await playlist.connect(msg.member.voice.channel)
    }

    if (!playlist.playing) playlist.play()
  }

  attachEventHandlers (playlist, channel) {
    playlist
      .on('playing', track =>
        new Embed(channel)
          .setTitle(track.title)
          .setURL(track.url)
          .addField(
            'Now playing.',
            `${track.formattedDuration} | Volume: ${track.volume}%`
          )
          .setAuthor(track.member)
          .setIcon(Embed.icons.PLAY)
          .setColor(Embed.colors.GREEN)
          .send()
      )
      .on('out', () =>
        new Embed(channel)
          .addField('We\'re out of tracks.', 'Better queue up some more!')
          .setIcon(Embed.icons.CLEAR)
          .setColor(Embed.colors.RED)
          .send()
      )
      .on('unavailable', (track, err) =>
        new Embed(channel)
          .setTitle(track.title)
          .setURL(track.url)
          .addField('An issue occured playing this track.', 'Skipping it.')
          .addField('Details', err.message)
          .setAuthor(track.member)
          .setIcon(Embed.icons.SKIP)
          .setColor(Embed.colors.CYAN)
          .send()
      )
      .on('error', error => this.client.logError(error))
  }
}

module.exports = PlayCommand
