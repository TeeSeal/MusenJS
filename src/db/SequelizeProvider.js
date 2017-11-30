const Collection = require('../structures/Collection.js')
const { deepFreeze } = require('../util/Util.js')

class SequelizeProvider {
  constructor(table, options = {}) {
    this.table = table
    this.idColumn = options.idColumn || 'id'
    this.cacheOnInit = options.cacheOnInit || false
    this.cacheTimeout = this.cacheOnInit ? 0 : options.cacheTimeout || 0
    this.defaultValues = options.defaultValues ? deepFreeze(options.defaultValues) : {}
    this.items = new Collection()
  }

  async init() {
    await this.table.sync()

    if (this.cacheOnInit) {
      const rows = await this.table.all()
      for (const row of rows) this.items.set(row[this.idColumn], sanitize(row.dataValues))
    }

    return this
  }

  get(id, key, defaultValue) {
    if (key === undefined) {
      return this.items.get(id) || this.defaultValues
    }

    if (defaultValue === undefined) {
      defaultValue = this.defaultValues[key]
    }

    if (this.items.has(id)) {
      const value = this.items.get(id)[key]
      return value === null ? defaultValue : value
    }

    return defaultValue
  }

  async fetch(id, key, defaultValue) {
    if (!this.items.has(id)) {
      const row = await this.table.findCreateFind({ where: { [this.idColumn]: id } })
        .then(r => r[0])

      this.items.set(id, sanitize(row.dataValues))

      if (this.cacheTimeout) {
        setTimeout(() => this.items.delete(id), this.cacheTimeout)
      }
    }

    return this.get(id, key, defaultValue)
  }

  async set(id, key, value) {
    const data = await this.fetch(id)

    if (typeof key === 'string') {
      data[key] = value
    } else {
      Object.assign(data, key)
    }

    this.items.set(id, data)
    return this.table.upsert(data)
  }

  delete(id, key) {
    const data = this.items.get(id) || {}
    delete data[key]

    return this.table.upsert({
      [this.idColumn]: id,
      [key]: null,
    })
  }

  clear(id) {
    this.items.delete(id)
    return this.table.destroy({ where: { [this.idColumn]: id } })
  }
}

function sanitize(object) {
  delete object.updatedAt
  delete object.createdAt
  return object
}

module.exports = SequelizeProvider
