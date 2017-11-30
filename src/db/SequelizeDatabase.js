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
    for (const [name, options] of Object.entries(tables)) {
      const table = this._db.define(name, options.schema)

      options.defaultValues = {}
      for (const [key, model] of Object.entries(options.schema)) {
        if (model.defaultValue) options.defaultValues[key] = model.defaultValue
      }

      this[name] = new SequelizeProvider(table, options)
      await this[name].init()
    }

    return this
  }
}

module.exports = SequelizeDatabase
