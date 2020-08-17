const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const db = { Sequelize }

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'src/db/database.sqlite'
})

const models = fs.readdirSync(path.join(__dirname, 'models'))
for (const file of models) {
  const builder = require(path.join(__dirname, 'models', file))
  const model = builder(sequelize, Sequelize)
  db[model.name] = model
}

db.sequelize = sequelize

module.exports = db
