const tags = require('common-tags')
const fs = require('fs')
const { join } = require('path')

const Color = require('./Color')
const { pageItemCount } = require('../config')

class Util {
  constructor () {
    throw new Error('this class may not be instantiated.')
  }

  static get COLOR () {
    return Color
  }

  static capitalize (string) {
    return string[0].toUpperCase() + string.slice(1)
  }

  static getDBData (msg, scope) {
    return {
      globally: { modelName: 'Setting', formattedScope: 'globally' },
      guild: {
        modelName: 'Guild',
        formattedScope: 'in this guild',
        id: msg.guild.id
      },
      channel: {
        modelName: 'Channel',
        formattedScope: 'in this channel',
        id: msg.channel.id
      }
    }[scope]
  }

  static filterObject (obj, keys, onlyTruthy) {
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

  static shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }

    return array
  }

  static flatten (arr, depth = 0) {
    return depth !== 1
      ? arr.reduce(
        (a, v) => a.concat(Array.isArray(v) ? Util.flatten(v, depth - 1) : v),
        []
      )
      : arr.reduce((a, v) => a.concat(v), [])
  }

  static recursiveReadDirSync (path) {
    const files = fs.readdirSync(path)

    return Util.flatten(
      files.map(file =>
        fs.statSync(join(path, file)).isDirectory()
          ? Util.recursiveReadDirSync(join(path, file))
          : join(path, file)
      )
    )
  }

  static deepFreeze (obj) {
    Object.values(obj)
      .filter(value => value instanceof Object)
      .forEach(value => Util.deepFreeze(value))
    Object.freeze(obj)

    return obj
  }

  static randomFrom (array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  static parserInRange (min, max) {
    return word => {
      if (!word || isNaN(word)) return null
      const num = parseInt(word)
      if (!isNaN(min) && num < min) return min
      if (!isNaN(max) && num > max) return max
      return num
    }
  }

  static paginate (arr, countOverwrite) {
    const count = countOverwrite || pageItemCount
    return arr
      .map((item, index) => {
        if (index % count !== 0) return null
        return arr.slice(index, index + count)
      })
      .filter(page => page)
  }
}

module.exports = new Proxy(Util, {
  get: (target, name) => {
    return name in target ? target[name] : tags[name]
  }
})
