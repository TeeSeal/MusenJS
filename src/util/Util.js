const tags = require('common-tags')
const path = require('path')

const Color = require('./Color.js')
const buildEmbed = require('./buildEmbed.js')
const paginate = require('./paginate.js')

class Util {
  constructor() {
    throw new Error('this class may not be instantiated.')
  }

  static get rootDir() { return __dirname.split(path.sep).slice(0, -1).join(path.sep) }
  static get COLOR() { return Color }
  static get buildEmbed() { return buildEmbed }
  static get paginate() { return paginate }
  static capitalize(string) { return string[0].toUpperCase() + string.slice(1) }


  static getDBData(msg, scope) {
    return scope === 'globally'
      ? ['client', 'haku', scope]
      : [`${scope}s`, msg[scope].id, `in this ${scope}`]
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
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
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

  static isJSON(string) {
    try {
      JSON.parse(string)
    } catch (err) {
      return false
    }
    return true
  }
}

module.exports = new Proxy(Util, {
  get: (target, name) => {
    return name in target ? target[name] : tags[name]
  },
})
