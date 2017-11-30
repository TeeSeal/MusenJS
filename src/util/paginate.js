const { pageItemCount } = require('../../config.json')

module.exports = function paginate(arr, countOverwrite) {
  const count = countOverwrite || pageItemCount
  return arr.map((item, index) => {
    if (index % count !== 0) return null
    return arr.slice(index, index + count)
  }).filter(page => page)
}
