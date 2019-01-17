require('./util/commandUtilExtension')
const MusenClient = require('./struct/MusenClient')
const client = new MusenClient()

client.init()
process.on('unhandledRejection', err => client.logError(err))
