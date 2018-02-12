const ReactionKeyboard = require('./ReactionKeyboard')
const { EventEmitter } = require('events')

class ReactionPagination extends EventEmitter {
  constructor(message, pages, opts = {}) {
    super()
    this.message = message
    this.pages = pages
    this.pageCount = pages.length
    this.current = opts.current || 0
    this.opts = opts
    this.kb = null

    this.listen()
  }

  listen() {
    this.kb = new ReactionKeyboard(
      this.message,
      {
        '⬅': 'left',
        '➡': 'right',
      },
      this.opts
    )

    this.kb.on('left', () => {
      if (this.current === 0) return
      this.current--
      this.emit('switch', this.pages[this.current], this.current)
    })

    this.kb.on('right', () => {
      if (this.current === this.pageCount - 1) return
      this.current++
      this.emit('switch', this.pages[this.current], this.current)
    })

    this.kb.once('end', () => this.emit('end'))
  }

  stop() {
    this.kb.stop()
  }
}

module.exports = ReactionPagination
