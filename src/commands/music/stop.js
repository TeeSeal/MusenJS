const { Command } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')
const ReactionPoll = require('../../struct/reaction/ReactionPoll')
const { canAdmin } = require('../../util')

const voteStops = new Set()

class StopCommand extends Command {
  constructor () {
    super('stop', {
      aliases: ['stop', 'stfu'],
      channelRestriction: 'guild',
      description: 'Stop playback.'
    })
  }

  async exec (msg) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist?.playing) return msg.util.error('nothing is currently playing.')

    if (canAdmin(msg.member)) {
      await playlist.stop()
      return msg.util.success('alright, crashing the party.')
    }

    if (msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (msg.member.voice.channel.members.size === 2) {
      await playlist.stop()
      return msg.util.success('stopped playback.')
    }

    if (voteStops.has(msg.guild.id)) {
      return msg.util.error('a voteskip is already in process.')
    }
    voteStops.add(msg.guild.id)

    const members = msg.member.voice.channel.members.filter(
      member => ![this.client.user.id, msg.author.id].includes(member.id)
    )
    const votesNeeded = Math.ceil(members.size / 2)

    const { track } = playlist
    const embed = await new Embed(msg.channel)
      .setTitle(track.title)
      .addField(
        'VOTESTOP',
        `Click the ✅ to vote.\n${votesNeeded + 1} votes needed.\nVote will end in 30 seconds.`
      )
      .setURL(track.url)
      .setAuthor(msg.member)
      .setIcon(Embed.icons.STOP)
      .setColor(Embed.colors.RED)
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
      voteStops.delete(msg.guild.id)

      embed
        .clearFields()
        .addField(success ? '✅ Playback stopped.' : '❌ Votestop failed.', '\u200b', false, true)

      if (success) await playlist.stop()
      return embed.edit()
    })
  }
}

module.exports = StopCommand
