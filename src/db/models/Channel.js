const { extend, cacheAll, setDefaults } = require('../CollectionModel')

module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define(
    'Channel',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      blacklist: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      disabled: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      hooks: {
        afterSync() {
          cacheAll.call(this)
          setDefaults.call(this)
        },
      },
    }
  )

  return extend(Channel)
}
