import chalk from 'chalk'
import yargs = require('yargs')

const cli = yargs
  .help('help')
  .alias('help', 'h')
  .demandCommand()
  .options({
    verbose: {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    },
  })
  .middleware(argv => {
    if (process.env.NODE_ENV === 'development') argv.verbose = true
    if (argv.verbose) {
      console.info()
      Object.keys(argv).forEach(k => {
        console.info(k.charAt(0).toUpperCase() + k.slice(1) + ':', argv[k])
      })
      console.info()
    }
  })
  .commandDir('cmd')
  .epilog('Made with ' + chalk.red('♥') + ' by Unstoppable Domains')
  .fail((msg, err) => {
    if (err || !msg) {
      console.error('Error:', err.message || 'unknown')
    } else if (msg.startsWith('Not enough non-option arguments:')) {
      cli.showHelp()
      console.error()
      console.error(msg)
    } else if (msg.startsWith('Missing required arguments:')) {
      cli.showHelp()
      console.error()
      console.error(msg)
    } else {
      console.error(msg)
    }
    process.exit(1)
  })
  .showHelpOnFail(false)

export default cli
