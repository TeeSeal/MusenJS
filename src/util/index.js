const tags = require('common-tags')
const path = require('path')

const Color = require('./Color')
const paginate = require('./paginate')

class Util {
  constructor() {
    throw new Error('this class may not be instantiated.')
  }

  static get rootDir() {
    return __dirname
      .split(path.sep)
      .slice(0, -1)
      .join(path.sep)
  }
  static get COLOR() {
    return Color
  }
  static get paginate() {
    return paginate
  }
  static capitalize(string) {
    return string[0].toUpperCase() + string.slice(1)
  }

  static getDBData(msg, scope) {
    return {
      globally: { modelName: 'Setting', formattedScope: 'globally' },
      guild: {
        modelName: 'Guild',
        formattedScope: 'in this guild',
        id: msg.guild.id,
      },
      channel: {
        modelName: 'Channel',
        formattedScope: 'in this channel',
        id: msg.channel.id,
      },
    }[scope]
  }

  static filterObject(obj, keys, onlyTruthy) {
    if (keys && !Array.isArray(keys)) {
      onlyTruthy = keys
      keys = Object.keys(obj)
    }

    const result = {}
    for (const key of keys) {
      if (onlyTruthy && !obj[key]) continue
      result[key] = obj[key]
    }
    return result
  }

  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }

    return array
  }

  static deepFreeze(obj) {
    Object.values(obj)
      .filter(value => value instanceof Object)
      .forEach(value => Util.deepFreeze(value))
    Object.freeze(obj)

    return obj
  }

  static randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  static parserInRange(min, max) {
    return word => {
      if (!word || isNaN(word)) return null
      const num = parseInt(word)
      if (!isNaN(min) && num < min) return min
      if (!isNaN(max) && num > max) return max
      return num
    }
  }
}

module.exports = new Proxy(Util, {
  get: (target, name) => {
    return name in target ? target[name] : tags[name]
  },
})
