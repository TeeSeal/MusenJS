const { EventEmitter } = require('events')
const ReactionKeyboard = require('./ReactionKeyboard')

class ReactionPoll extends EventEmitter {
  constructor(message, emojis, opts = {}) {
    if (!emojis) throw new Error('you need to specify emojis to use.')
    super()

    const { emojiToEvent, events } = ReactionPoll.handleEmojis(emojis)
    this.message = message
    this.opts = opts
    this.events = events
    this.emojiToEvent = emojiToEvent
    this.votes = new Map(events.map(event => [event, new Set()]))
    this.keyboard = null

    this.collect()
  }

  collect() {
    this.keyboard = new ReactionKeyboard(
      this.message,
      this.emojiToEvent,
      this.opts
    )

    for (const event of this.events) {
      this.keyboard.on(event, (user, pressed) => {
        const vote = this.votes.get(event)
        if (pressed) {
          vote.add(user.id)
          return this.emit('vote', event, user)
        }
        vote.delete(user.id)
        this.emit('unvote', event, user)
      })
    }

    this.keyboard.once('end', () => {
      this.emit('end', this.votes)
    })
  }

  stop() {
    this.keyboard.stop()
  }

  static handleEmojis(emojis) {
    if (!Array.isArray(emojis)) {
      return { emojiToEvent: emojis, events: Object.values(emojis) }
    }
    const res = {}
    for (const emoji of emojis) res[emoji] = emoji
    return { emojiToEvent: res, events: emojis }
  }
}

module.exports = ReactionPoll
