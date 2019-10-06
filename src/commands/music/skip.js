const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const ReactionPoll = require('../../struct/reaction/ReactionPoll')
const Music = require('../../struct/music')

const voteSkips = new Set()

class SkipCommand extends Command {
  constructor () {
    super('skip', {
      aliases: ['skip'],
      channelRestriction: 'guild',
      description: 'Skip the currently palying song.'
    })
  }

  async exec (msg) {
    const playlist = Music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    const memberChannelID = (msg.member.voice.channel || {}).id
    if (memberChannelID !== playlist.connection.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    const { playable } = playlist

    if (
      msg.member.permissions.has('MANAGE_GUILD') ||
      playable.member.id === msg.member.id ||
      msg.member.voice.channel.members.size === 2
    ) {
      await playlist.fadeVolume(0)
      await new Embed(msg.channel)
        .setTitle(playable.title)
        .addField('✅ Skipped.', '\u200b')
        .setURL(playable.url)
        .setAuthor(msg.member)
        .setIcon(Embed.icons.SKIP)
        .setColor(Embed.colors.CYAN)
        .send()

      return playlist.skip()
    }

    if (voteSkips.has(msg.guild.id)) {
      return msg.util.error('a voteskip is already in process.')
    }
    voteSkips.add(msg.guild.id)

    const members = msg.member.voice.channel.members.filter(
      member => ![this.client.user.id, msg.author.id].includes(member.id)
    )
    const votesNeeded = Math.ceil(members.size / 2)

    const embed = await new Embed(msg.channel)
      .setTitle(playable.title)
      .addField(
        'VOTESKIP',
        `Click the ✅ to vote.\n${votesNeeded +
          1} votes needed.\nVote will end in 30 seconds.`
      )
      .setURL(playable.url)
      .setAuthor(msg.member)
      .setIcon(Embed.icons.SKIP)
      .setColor(Embed.colors.CYAN)
      .send()

    const poll = new ReactionPoll(
      embed.message,
      { '✅': 'yes' },
      {
        users: members.map(m => m.id),
        time: 3e4
      }
    )

    poll.on('vote', () => {
      if (poll.votes.get('yes').size >= votesNeeded) poll.stop()
    })

    poll.once('end', async votes => {
      const success = votes.get('yes').size >= votesNeeded
      voteSkips.delete(msg.guild.id)

      embed
        .clearFields()
        .addField(success ? '✅ Skipped.' : '❌ Voteskip failed.', '\u200b')

      if (success) {
        await playlist.fadeVolume(0)
        playlist.skip()
      }
      return embed.edit()
    })
  }
}

module.exports = SkipCommand
