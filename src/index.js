require('dotenv').config()

const { AkairoClient, CommandUtil } = require('discord-akairo')
const { sequelize, Guild } = require('./db')
const { ownerID } = require('./config')
const logr = require('logr')

const client = new AkairoClient({
  prefix: msg => Guild.get(msg.guild ? msg.guild.id : 'dm', 'prefix'),
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: 'src/commands/',
  inhibitorDirectory: 'src/inhibitors/',
  listenerDirectory: 'src/listeners/'
})

async function init() {
  try {
    logr.info('Connecting to database...')
    await sequelize.sync()
    logr.success('OK')

    logr.info('Logging in...')
    client.login(process.env.TOKEN)
  } catch (err) {
    throw err
  }
}
init()

process.on('unhandledRejection', err => {
  logr.error(err)

  const owner = client.users.get(client.akairoOptions.ownerID)
  if (!owner) return

  owner.send(`Got an unhandledRejection:\n\`\`\`${err.stack}\`\`\``)
})

Object.assign(CommandUtil.prototype, {
  info(content, opts) {
    const name = this.message.member
      ? this.message.member.displayName
      : this.message.author.username
    return this.send(`**${name}** | ${content}`, opts)
  },

  success(content, opts) {
    return this.info(`✅ ${content}`, opts)
  },
  error(content, opts) {
    return this.info(`❌ ${content}`, opts)
  }
})
