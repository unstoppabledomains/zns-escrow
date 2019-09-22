export const command = 'deposit <command>'
export const desc = 'Deposit assets onto an escrow contract'
export const builder = yargs => yargs.commandDir('group/deposit')
export const handler = argv => {}
