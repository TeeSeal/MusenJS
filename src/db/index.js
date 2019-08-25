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
  const model = sequelize.import(path.join(__dirname, 'models', file))
  db[model.name] = model
}

db.sequelize = sequelize

module.exports = db
