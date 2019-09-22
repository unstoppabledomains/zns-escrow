import {readFileSync} from 'fs'
import {homedir} from 'os'
import {join} from 'path'
import cli from '../cli'

export const command = 'history'
export const desc = 'Get history of actions'
export const builder = (yargs: typeof cli) =>
  yargs.options({
    limit: {
      alias: 'l',
      type: 'number',
      description: 'Specify the number of logs',
    },
  })

export const handler = async (argv: ReturnType<typeof builder>['argv']) => {
  let logs = readFileSync(join(homedir(), '.zns-escrow/history.log'), 'utf8')
    .split('\n')
    .filter(v => v)

  if (!argv.limit) {
    const match = (process.argv[3] || '').match(/^\-(\d)+$/)
    if (match) {
      argv.limit = Number(match[1])
    }
  }

  if (argv.limit) {
    logs = logs.slice(-argv.limit)
  }

  for (const {timestamp, message} of logs.map(line =>
    JSON.parse(JSON.parse(line).message),
  )) {
    console.log(`[${new Date(timestamp as any).toISOString()}] ${message}`)
  }

  process.exit()
}
