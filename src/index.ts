import cli from './cli'

process.on('SIGINT', () => {
  console.log('Stopping...')
  process.exit()
})

cli.argv
