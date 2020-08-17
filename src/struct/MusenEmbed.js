const PaginatedEmbed = require('./PaginatedEmbed')

class MusenEmbed extends PaginatedEmbed {
  constructor (...args) {
    super(...args)
    this.icons = []
  }

  // Custom embed methods
  attachIcon (icon) {
    if (this.icons.includes(icon)) return this
    this.icons.push(icon)
    this.attachFiles([`src/assets/icons/${icon}`])
    return this
  }

  setIcon (icon) {
    this.setThumbnail(icon)
    return this
  }

  setAuthor (member) {
    if (member.user) {
      super.setAuthor(member.displayName, member.user.displayAvatarURL())
    } else {
      super.setAuthor(member.username, member.displayAvatarURL())
    }
    return this
  }

  // Constants
  static get colors () {
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
      WHITE: 15921906
    }
  }

  static get icons () {
    return {
      CLEAR: 'https://i.imgur.com/6zfkTll.png',
      LIST: 'https://i.imgur.com/jcBpjId.png',
      PAUSE: 'https://i.imgur.com/1NylFqr.png',
      PLAY: 'https://i.imgur.com/idzsnYK.png',
      PLAYLIST_ADD: 'https://i.imgur.com/I9iP7v6.png',
      SKIP: 'https://i.imgur.com/TrNzg5u.png',
      TIME: 'https://i.imgur.com/XEQNaEy.png',
      VOLUME_UP: 'https://i.imgur.com/mfRmQBu.png',
      VOLUME_DOWN: 'https://i.imgur.com/L1su2Ry.png',
      POLL: 'https://i.imgur.com/AR44KeY.png',
      STOP: 'https://i.imgur.com/HVArfu0.png'
    }
  }
}

module.exports = MusenEmbed
