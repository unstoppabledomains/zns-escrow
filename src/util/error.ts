export default function error(message, showHelp = false) {
  if (showHelp) {
    // cli.showHelp()
  }

  console.error('Error:', message)

  process.exit(1)
}
