const { EventEmitter } = require('events')

class ReactionKeyboard extends EventEmitter {
  constructor (message, emojiToEvent, { users, time, remove }) {
    super()
    this.message = message
    this.events = emojiToEvent
    this.emojis = Object.keys(emojiToEvent)
    this.users = users || null
    this.time = time || 6e4
    this.remove = remove || true
    this.reactions = []

    this.react().then(() => this.listen())
  }

  async react () {
    for (const emoji of this.emojis) {
      this.reactions.push(await this.message.react(emoji))
    }
    return this.message
  }

  listen () {
    const { emojis, users, time } = this

    this.collector = this.message.createReactionCollector(
      (reaction, user) => {
        if (user.id === this.message.client.user.id) return false
        const emojiFlag = [reaction.emoji.name, reaction.emoji.identifier].some(
          id => emojis.includes(id)
        )

        if (!users) return emojiFlag
        return emojiFlag && users.includes(user.id)
      },
      { time, dispose: true }
    )

    this.collector.on('collect', (reaction, user) => {
      const emoji = [reaction.emoji.name, reaction.emoji.identifier].find(id =>
        this.emojis.includes(id)
      )

      const event = this.events[emoji]
      return this.emit(event, user, true, reaction)
    })

    this.collector.on('remove', (reaction, user) => {
      const emoji = [reaction.emoji.name, reaction.emoji.identifier].find(id =>
        this.emojis.includes(id)
      )

      const event = this.events[emoji]
      return this.emit(event, user, false, reaction)
    })

    this.collector.once('end', () => {
      if (this.remove) this.removeReactions()
      this.emit('end')
    })
  }

  removeReactions () {
    for (const reaction of this.reactions) {
      // TODO: Try to remove all reactions
      if (reaction.me) reaction.users.remove()
    }
  }

  stop () {
    this.collector.stop()
  }
}

module.exports = ReactionKeyboard
