const { Command } = require('discord-akairo')
const { inspect } = require('util')
const { stripIndents } = require('common-tags')

class EvalCommand extends Command {
  constructor() {
    super('eval', {
      aliases: ['eval'],
      ownerOnly: true,
      description: 'Evaluate some code.',
      args: [
        {
          id: 'noOutput',
          match: 'flag',
          prefix: ['-no', '-noOutput'],
        },
        {
          id: 'code',
          match: 'rest',
        },
      ],
    })
  }

  async exec(msg, args) {
    const { code, noOutput } = args
    let evaled
    try {
      evaled = eval(code)
    } catch (err) {
      evaled = `${err.name}: ${err.message}`
    }

    evaled = evaled instanceof Promise ? await evaled : evaled
    const lang = getLang(evaled)
    let output = clean(evaled)
    if (output.includes(this.client.token)) {
      output = output.replace(
        new RegExp(escapeRegExp(this.client.token), 'g'),
        '--- token was here ---'
      )
    }

    if (noOutput) return
    return msg.util.send(stripIndents`
      :inbox_tray: **INPUT:**
      \`\`\`js
      ${code}
      \`\`\`
      :outbox_tray: **OUTPUT:**
      \`\`\`${lang}
      ${output}
      \`\`\`
    `)
  }
}

function getLang(thing) {
  return typeof thing === 'string' ? '' : 'js'
}

function clean(thing) {
  let inspected = typeof thing === 'string' ? thing : inspect(thing)
  if (inspected.length < 500) return inspected

  let output = ''
  const lines = inspected.split('\n').map(line => {
    return line.length > 100 ? `${line.slice(0, 100)}...` : line
  })

  while (output.length < 500 && lines[0] && output.split('\n').length < 21) {
    output += `${lines.shift()}\n`
  }
  if (lines[0]) output += '. . .'
  return output
}

function escapeRegExp(str) {
  return str.replace(/-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

module.exports = EvalCommand
