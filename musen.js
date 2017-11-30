const MusenClient = require('./src/structures/MusenClient.js')
const { ownerID } = require('./config.json')
const logr = require('logr')

const client = new MusenClient({
  prefix: msg => client.db.guilds
    .get(msg.guild ? msg.guild.id : 'dm', 'prefix'),
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: 'src/commands/',
  inhibitorDirectory: 'src/inhibitors/',
  listenerDirectory: 'src/listeners/',
  database: 'src/db/database.sqlite',
})

client.init()

process.on('unhandledRejection', err => {
  logr.error(err)

  const owner = client.users.get(client.akairoOptions.ownerID)
  if (!owner) return

  owner.send(`Got an unhandledRejection:\n\`\`\`${err.stack}\`\`\``)
})
