const Sequelize = require('sequelize')
const SequelizeProvider = require('./SequelizeProvider.js')
const tables = require('./tables.js')

class SequelizeDatabase {
  constructor(path) {
    this._db = new Sequelize('haku', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: path,
      operatorsAliases: Sequelize.Op,
    })
  }

  async init() {
    for (const [name, opts] of Object.entries(tables)) {
      const table = this._db.define(name, opts.schema)

      opts.defaultValues = {}
      for (const [key, model] of Object.entries(opts.schema)) {
        if (model.defaultValue) opts.defaultValues[key] = model.defaultValue
      }

      this[name] = new SequelizeProvider(table, opts)
      await this[name].init()
    }

    return this
  }
}

module.exports = SequelizeDatabase
