export const command = 'withdraw <command>'
export const desc = 'Withdraw assets onto an escrow contract'
export const builder = yargs => yargs.commandDir('group/withdraw')
export const handler = argv => {}
