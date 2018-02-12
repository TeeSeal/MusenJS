const { Command } = require('discord-akairo')
const execute = require('util').promisify(require('child_process').exec)

class ExecCommand extends Command {
  constructor() {
    super('exec', {
      aliases: ['exec'],
      ownerOnly: true,
      description: 'execute a command in the terminal.',
      args: [
        {
          id: 'command',
          match: 'rest',
        },
      ],
    })
  }

  exec(msg, args) {
    const { command } = args
    if (!command) return msg.util.error('give me something to run.')

    return execute(command)
      .then(({ stdout, stderr }) => {
        return msg.util.send(stderr || stdout, { code: true })
      })
      .catch(err => {
        return msg.util.send(err, { code: true })
      })
  }
}

module.exports = ExecCommand
