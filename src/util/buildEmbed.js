const Color = require('./Color.js')
const { stripIndents } = require('common-tags')
const paginate = require('./paginate.js')

function buildEmbed(obj) { // eslint-disable-line
  const embed = {}
  if (obj.icon) obj.thumbnail = `src/assets/icons/${obj.icon}.png`

  const files = [obj.thumbnail, obj.image]
    .filter(image => image && !image.startsWith('http'))
    .map(image => { return { attachment: image } })

  for (const image of ['thumbnail', 'image']) {
    if (!obj[image]) continue
    embed[image] = obj[image].startsWith('http')
      ? { url: obj[image] }
      : { url: `attachment://${obj[image].split('/').slice(-1)[0]}` }
  }

  if (obj.author) {
    embed.author = {
      name: obj.author.displayName,
      icon_url: obj.author.user.displayAvatarURL() // eslint-disable-line
    }
  }

  if (obj.color) {
    embed.color = Color[obj.color.toUpperCase()]
  }

  embed.fields = parseFields(obj.fields)
  embed.description = obj.description || ''

  if (obj.paginate) {
    const options = obj.paginate
    const paginated = paginate(options.items, options.by)

    let page = options.page || 1
    if (page < 1) page = 1
    if (page > paginated.length) page = paginated.length

    if (paginated.length !== 0) {
      if (Array.isArray(options.items[0])) {
        embed.fields = embed.fields.concat(parseFields(paginated[page - 1]))
      } else {
        embed.description += `\n${paginated[page - 1].join('\n')}`
      }
    }

    if (paginated.length > 1) {
      embed.footer = {
        text: stripIndents`
          Page: ${page}/${paginated.length} | Use: '${options.commandName} page=<integer>' to view another page.
        `,
      }
    }
  }

  if (obj.footer) {
    if (typeof obj.footer === 'string') embed.footer = { text: obj.footer }
    else embed.footer = obj.footer
  }

  if (obj.title) embed.title = obj.title
  if (obj.timestamp) embed.timestamp = obj.timestamp
  if (obj.url) embed.url = obj.url

  return { embed, files }
}

function parseFields(fields) {
  if (!fields) return []
  return fields.map(field => {
    return {
      name: field[0],
      value: field[1],
      inline: field[2],
    }
  })
}

module.exports = buildEmbed
