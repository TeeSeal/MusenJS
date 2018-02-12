const Collection = require('../struct/Collection.js')
const { deepFreeze } = require('../util')

// ---- HOOKS ----
async function cacheAll() {
  const rows = await this.all()
  for (const row of rows) {
    this.collection.set(row[this.pk], row)
  }
}

async function setDefaults() {
  const attrs = await this.describe()
  this.defaultValues = {}

  for (const [key, opts] of Object.entries(attrs)) {
    if (['createdAt', 'updatedAt'].includes(key)) continue

    if (opts.defaultValue) {
      let parsed = opts.defaultValue
      if (opts.type === 'JSON') parsed = JSON.parse(parsed)
      if (['INTEGER', 'FLOAT'].includes(opts.type)) parsed = Number(parsed)

      this.defaultValues[key] = parsed
    }
  }

  deepFreeze(this.defaultValues)
}

// ---- HELPERS ----
function get(id, key, defaultValue) {
  if (!key) {
    return this.collection.get(id) || this.defaultValues
  }

  if (defaultValue === undefined) {
    defaultValue = this.defaultValues[key]
  }

  if (this.collection.has(id)) {
    const value = this.collection.get(id)[key]
    return value === null ? defaultValue : value
  }

  return defaultValue
}

async function fetch(id, key, defaultValue) {
  if (!this.collection.has(id)) {
    const [row] = await this.findCreateFind({ where: { [this.pk]: id } })
    this.collection.set(id, row)

    if (this.cacheTimeout) {
      setTimeout(() => this.collection.delete(id), this.cacheTimeout)
    }
  }

  return this.get(id, key, defaultValue)
}

async function set(id, key, value) {
  const instance = await this.fetch(id)

  if (typeof key === 'string') {
    instance.set(key, value)
  } else {
    for (const [k, v] of Object.entries(key)) {
      instance.set(k, v)
    }
  }

  return instance.save()
}

function remove(id, key) {
  const data = this.collection.get(id) || {}
  delete data[key]

  return this.upsert({
    [this.pk]: id,
    [key]: null,
  })
}

function clear(id) {
  this.collection.delete(id)
  return this.destroy({ where: { [this.pk]: id } })
}

function extend(model, cacheTimeout = 0) {
  Object.assign(model, {
    pk: model.primaryKeyAttributes[0],
    get,
    set,
    fetch,
    delete: remove,
    clear,
    collection: new Collection(),
    cacheTimeout,
  })
  return model
}

module.exports = {
  cacheAll,
  setDefaults,
  extend,
}
