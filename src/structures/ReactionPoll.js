const EventEmitter = require('events')
const Collection = require('./Collection.js')

class ReactionPoll extends EventEmitter {
  constructor(message, options) {
    if (!options.emojis) throw new Error('you need to specify emojis to use.')

    super()

    this.emojis = options.emojis
    this.users = options.users || []
    this.time = options.time || 15e3
    this.message = message
    this.votes = new Collection(this.emojis.map(emoji => {
      return [emoji, []]
    }))

    this.react().then(() => this.collect())
  }

  async react() {
    for (const emoji of this.emojis) {
      await this.message.react(emoji)
    }
    return this.message
  }

  collect() {
    const { time, users, emojis } = this

    const collector = this.message.createReactionCollector((reaction, user) => {
      const emojiFlag = [reaction.emoji.name, reaction.emoji.identifier]
        .some(id => emojis.includes(id))

      if (users.length === 0) return emojiFlag
      return emojiFlag && users.includes(user.id)
    }, { time })

    this.collector = collector

    collector.on('collect', reaction => {
      const reactionUsers = Array.from(reaction.users.keys())
      const emoji = [reaction.emoji.name, reaction.emoji.identifier]
        .find(id => this.emojis.includes(id))


      const userID = this.users.find(id => {
        return reactionUsers.includes(id) && !this.votes.get(emoji).includes(id)
      })

      this.votes.set(emoji, reactionUsers.filter(id => this.users.includes(id)))

      if (!userID) return
      return this.emit('vote', emoji, userID)
    })

    collector.once('end', () => {
      this.emit('end', this.votes)
    })
  }

  stop() { this.collector.stop() }
}

module.exports = ReactionPoll
