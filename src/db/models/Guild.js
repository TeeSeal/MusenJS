const { extend, cacheAll, setDefaults } = require('../CollectionModel')
const { prefix } = require('../../config')

module.exports = (sequelize, DataTypes) => {
  const Guild = sequelize.define(
    'Guild',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      prefix: {
        type: DataTypes.STRING,
        defaultValue: prefix,
      },
      blacklist: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      disabled: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      defaultVolume: {
        type: DataTypes.INTEGER,
        defaultValue: 25,
      },
      maxVolume: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      maxSongDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 15,
      },
      songLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      eightBall: {
        type: DataTypes.JSON,
        defaultValue: [
          'Yes.',
          'Absolutely.',
          'Most likely.',
          'Without a doubt.',
          'It is certain.',
          'My sources say no.',
          'Nuh-huh.',
          'Very doubtful.',
          'Nah.',
          'My sources say no.',
        ],
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

  return extend(Guild)
}
