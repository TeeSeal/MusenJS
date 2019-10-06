const { MessageEmbed, Util: { splitMessage } } = require('discord.js')
const { embed: { textLimit, fieldLimit } } = require('../config')
const { paginate } = require('../util')
const ReactionPagination = require('./reaction/ReactionPagination')

class PaginatedEmbed extends MessageEmbed {
  constructor (channel) {
    super()
    this.channel = channel
    this.message = null
    this.sent = false

    this.users = null
    this.pagination = null
    this.page = 0
    this._description = ''
    this._fields = []
    this.textLimit = textLimit
    this.fieldLimit = fieldLimit
    this.itemsPerPage = null
  }

  // Message actions
  async send () {
    if (!this.channel) throw new Error('No channel given.')
    if (this.sent) return this.edit()
    this.handlePagination()
    this.message = await this.channel.send(this)
    this.sent = true
    if (this.pagination) this.listen()
    return this
  }

  async edit () {
    if (!this.sent) return this.send()
    await this.message.edit(this)
    return this
  }

  // Settings
  addUser (user) {
    if (!this.users) this.users = []
    this.users.push(user)
  }

  setUsers (users) {
    this.users = users
  }

  setTextLimit (number) {
    if (number > 2000 || number < 1) return this
    this.textLimit = number
    return this
  }

  setFieldLimit (number) {
    if (number > 20 || number < 1) return this
    this.fieldLimit = number
    return this
  }

  setItemsPerPage (number) {
    this.itemsPerPage = number
    return this
  }

  setPage (number) {
    if (isNaN(number)) return this
    this.page = number - 1
    return this
  }

  // Overloaded methods
  setDescription (description, sup = false) {
    if (sup || !this.channel) super.setDescription(description)
    else this._description = description
    return this
  }

  addField (name, value, inline = false, sup = false) {
    if (sup || !this.channel) super.addField(name, value, inline)
    else this._fields.push([name, value, inline])
    return this
  }

  // Util methods
  addFields (fields, sup = false) {
    for (const field of fields) this.addField(field[0], field[1], field[2], sup)
    return this
  }

  setFields (fields, sup = false) {
    this.clearFields()
    this.addFields(fields, sup)
    return this
  }

  clearFields () {
    this.fields = []
    return this
  }

  // Main pagination methods
  handlePagination () {
    this.checkDescription()
    this.checkFields()
    this.changePage()
  }

  changePage (page, number) {
    if (!this.pagination) return
    if (!page && !number) {
      number = this.pagination.page
      page = this.pagination.items[number]
    }

    const method =
      this.pagination.type === 'fields' ? 'setFields' : 'setDescription'

    this[method](this.pagination.items[number], true)
    this.setPaginationFooter(number)
    this.pagination.page = number
  }

  setPaginationFooter (number, tooltip = true) {
    if (this.pagination.items.length < 2) return

    const { items, totalSize } = this.pagination
    let footer = `Page: ${number + 1}/${items.length} | ${totalSize} items`

    if (tooltip) footer += ' | Use the arrows to cycle through pages.'

    this.setFooter(footer)
  }

  listen () {
    if (this.pagination.items.length < 2) return

    new ReactionPagination(this.message, this.pagination.items, {
      current: this.pagination.page,
      users: this.users
    })
      .on('switch', (page, number) => {
        this.changePage(page, number)
        this.edit()
      })
      .on('end', () => {
        this.setPaginationFooter(this.pagination.page, false)
        this.edit()
      })
  }

  // Pagination checks
  checkDescription () {
    if (!this._description) return
    if (Array.isArray(this._description)) {
      this.pagination = PaginatedEmbed.parsePagination({
        items: this._description,
        page: this.page,
        by: this.itemsPerPage
      })
      return
    }

    if (!this._description.length > this.textLimit) {
      return super.setDescription(this._description)
    }

    const chunks = splitMessage(this._description, {
      maxLength: this.textLimit,
      char: ' ',
      append: '...',
      prepend: '...'
    })

    this.pagination = PaginatedEmbed.parsePagination({
      items: chunks,
      page: this.page,
      by: 1
    })
  }

  checkFields () {
    if (!this._fields) return
    if (this._fields.length <= this.fieldLimit) {
      return this.setFields(this._fields, true)
    }

    if (this.pagination) {
      throw new Error(
        'can\'t paginate both fields and description at the same time.'
      )
    }

    this.pagination = PaginatedEmbed.parsePagination({
      items: this._fields,
      page: this.page,
      by: this.fieldLimit
    })
  }

  // Static helpers
  static parsePagination (opts) {
    if (!opts.items) return null

    const items = Array.from(opts.items)
    if (!items || items.length === 0) return null

    const paginated = paginate(items, opts.by)

    let page = opts.page || 0
    if (page < 0) page = 0
    if (page >= paginated.length) page = paginated.length - 1
    const result = {
      totalSize: opts.items.length,
      page
    }

    result.type = Array.isArray(items[0]) ? 'fields' : 'description'
    result.items = paginated

    return result
  }
}

module.exports = PaginatedEmbed
