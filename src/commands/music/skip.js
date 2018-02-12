const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const ReactionPoll = require('../../struct/reaction/ReactionPoll')
const Music = require('../../struct/music')

const voteSkips = new Set()

class SkipCommand extends Command {
  constructor() {
    super('skip', {
      aliases: ['skip'],
      channelRestriction: 'guild',
      description: 'Skip the currently palying song.',
    })
  }

  async exec(msg) {
    const playlist = Music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    const { song } = playlist

    if (
      msg.member.permissions.has('MANAGE_GUILD')
      || song.member.id === msg.member.id
      || msg.member.voiceChannel.members.size === 2
    ) {
      return new Embed(msg.channel)
        .setTitle(song.title)
        .addField('✅ Skipped.', '\u200b')
        .setURL(song.url)
        .setAuthor(msg.member)
        .setIcon(Embed.icons.SKIP)
        .setColor(Embed.colors.CYAN)
        .send()
        .then(() => playlist.skip())
    }

    if (voteSkips.has(msg.guild.id)) {
      return msg.util.error('a voteskip is already in process.')
    }
    voteSkips.add(msg.guild.id)

    const members = msg.member.voiceChannel.members.filter(
      member => ![this.client.user.id, msg.author.id].includes(member.id)
    )
    const votesNeeded = Math.ceil(members.size / 2)

    const embed = await new Embed(msg.channel)
      .setTitle(song.title)
      .addField(
        'VOTESKIP',
        `Click the ✅ to vote.\n${votesNeeded
          + 1} votes needed.\nVote will end in 30 seconds.`
      )
      .setURL(song.url)
      .setAuthor(msg.member)
      .setIcon(Embed.icons.SKIP)
      .setColor(Embed.colors.CYAN)
      .send()

    const poll = new ReactionPoll(
      embed.message,
      { '✅': 'yes' },
      {
        users: members.map(m => m.id),
        time: 3e4,
      }
    )

    poll.on('vote', () => {
      if (poll.votes.get('yes').size >= votesNeeded) poll.stop()
    })

    poll.once('end', votes => {
      const success = votes.get('yes').size >= votesNeeded
      voteSkips.delete(msg.guild.id)

      embed
        .clearFields()
        .addField(success ? '✅ Skipped.' : '❌ Voteskip failed.', '\u200b')

      if (success) playlist.skip()
      return embed.edit()
    })
  }
}

module.exports = SkipCommand
