const { Command, Argument } = require('discord-akairo')
const { stripIndents } = require('../../util')
const Embed = require('../../struct/MusenEmbed')

const { Guild } = require('../../db')

class VolumeCommand extends Command {
  constructor () {
    super('volume', {
      aliases: ['volume', 'vol'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'newVolume',
          type (msg, word) {
            return Argument
              .range('integer', 0, Guild.get(msg.guild.id).maxVolume, true)
              .bind(this)(msg, word)
          }
        }
      ],
      description: stripIndents`
        Change playback volume.
        Ranges from 1 to 100.

        **Usage:**
        \`volume 30\` => sets the volume to 30%.
      `
    })
  }

  async exec (msg, { newVolume }) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    if (msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    const { volume, playable } = playlist

    if (!newVolume) {
      return new Embed(msg.channel)
        .setTitle(playable.title)
        .addField(`Volume: ${volume}%`, '\u200b')
        .setURL(playable.url)
        .setAuthor(msg.member)
        .setIcon(Embed.icons.VOLUME_UP)
        .setColor(Embed.colors.YELLOW)
        .send()
    }

    const icon =
      newVolume < volume ? Embed.icons.VOLUME_DOWN : Embed.icons.VOLUME_UP

    await playlist.fadeVolume(newVolume)

    return new Embed(msg.channel)
      .setTitle(playable.title)
      .setURL(playable.url)
      .setAuthor(msg.member)
      .addField(`Volume: ${newVolume}%`, '\u200b')
      .setIcon(icon)
      .setColor(Embed.colors.YELLOW)
      .send()
  }
}

module.exports = VolumeCommand
