const config = require('../../config')
const settings = { blacklist: [], disabled: [], ...config }
const { extend } = require('../CollectionModel')

async function afterSync() {
  for (const [name, value] of Object.entries(settings)) {
    const stringValue
      = value instanceof Object ? JSON.stringify(value) : value.toString()

    const [row] = await this.findCreateFind({
      where: { name },
      defaults: { name, value: stringValue, type: typeof value },
    })

    this.collection.set(row[this.pk], row)
  }
}

module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define(
    'Setting',
    {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      value: DataTypes.STRING,
      type: DataTypes.STRING,
    },
    {
      hooks: { afterSync },
    }
  )

  Setting.prototype.parsedValue = function parsedValue() {
    if (this.type === 'number') return Number(this.value)
    if (this.type === 'object') return JSON.parse(this.value)
    return this.value
  }

  extend(Setting)
  const { get } = Setting

  Object.assign(Setting, {
    get(name) {
      return get.call(this, name).parsedValue()
    },

    async getAll() {
      const res = {}
      for (const setting of await this.all()) {
        res[setting.name] = setting.parsedValue()
      }
      return res
    },
  })

  return Setting
}
