const { extend, cacheAll, setDefaults } = require('../CollectionModel')
const { prefix } = require('../../config')

module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define(
    'Guild',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      prefix: {
        type: DataTypes.STRING,
        defaultValue: prefix
      },
      blacklist: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      disabled: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      defaultVolume: {
        type: DataTypes.INTEGER,
        defaultValue: 25
      },
      maxVolume: {
        type: DataTypes.INTEGER,
        defaultValue: 100
      },
      trackLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100
      }
    },
    {
      hooks: {
        afterSync () {
          cacheAll.call(this)
          setDefaults.call(this)
        }
      }
    }
  )

  return extend(Guild)
}
