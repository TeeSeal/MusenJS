const Sequelize = require('sequelize')
const { prefix } = require('../../config.json')

module.exports = {
  client: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    cacheOnInit: true,
  },

  guilds: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      prefix: {
        type: Sequelize.STRING,
        defaultValue: prefix,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      maxVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      defaultVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 25,
      },
    },
    cacheOnInit: true,
  },

  channels: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    cacheOnInit: true,
  },

  stations: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      providerID: Sequelize.STRING,
    },
    cacheOnInit: true,
  },
}
