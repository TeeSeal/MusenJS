const PaginatedEmbed = require('./PaginatedEmbed')

class MusenEmbed extends PaginatedEmbed {
  constructor(...args) {
    super(...args)
    this.icons = []
  }

  // Custom embed methods
  attachIcon(icon) {
    if (this.icons.includes(icon)) return this
    this.icons.push(icon)
    this.attachFiles([`src/assets/icons/${icon}`])
    return this
  }

  setIcon(icon) {
    if (!this.icons.includes(icon)) this.attachIcon(icon)
    this.setThumbnail(`attachment://${icon}`)
    return this
  }

  setAuthor(member) {
    if (member.user) {
      super.setAuthor(member.displayName, member.user.displayAvatarURL())
    } else {
      super.setAuthor(member.username, member.displayAvatarURL())
    }
    return this
  }

  // Constants
  static get colors() {
    return {
      YELLOW: 16763904,
      RED: 16731469,
      BLUE: 6711039,
      PURPLE: 12517631,
      GREEN: 5025610,
      CYAN: 6750207,
      GOLD: 16758861,
      ORANGE: 16029762,
      SCARLET: 13369446,
      WHITE: 15921906,
    }
  }

  static get icons() {
    return {
      CLEAR: 'clear.png',
      GAME: 'game.png',
      LIST: 'list.png',
      PAUSE: 'pause.png',
      PLAY: 'play.png',
      PLAYLIST_ADD: 'playlistAdd.png',
      SKIP: 'skip.png',
      TIME: 'time.png',
      VOLUME_UP: 'volumeUp.png',
      VOLUME_DOWN: 'volumeDown.png',
      POLL: 'poll.png',
      STOP: 'stop.png',
    }
  }
}

module.exports = MusenEmbed
