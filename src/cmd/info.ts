import {toBech32Address} from '@zilliqa-js/crypto'
import infoOptions from '../builder/infoOptions'
import cli from '../cli'
import domainPreflight from '../middleware/domainPreflight'
import escrowPreflight from '../middleware/escrowPreflight'
import zilliqaPreflight from '../middleware/zilliqaPreflight'
import error from '../util/error'

export const command = 'info <escrow> [domain]'
export const describe = 'Get information about escrow'
export const builder = (yargs: typeof cli) =>
  yargs
    .positional('escrow', {
      type: 'string',
      describe: 'Escrow contract address',
    })
    .positional('domain', {
      type: 'string',
      describe: 'Domain to sell',
    })
    .demandOption('escrow')
    .options(infoOptions)
    .middleware([escrowPreflight, domainPreflight, zilliqaPreflight(false)])

export const handler = async (argv: ReturnType<typeof builder>['argv']) => {
  const {escrow, zilliqa} = argv as any

  const escrowContract = zilliqa.contracts.at(escrow)

  const [init, state] = await Promise.all([
    escrowContract.getInit().then(resp => {
      if (!resp) return
      return resp.reduce((a, v) => {
        a[v.vname] = v.value
        return a
      }, {})
    }),
    escrowContract.getState(),
  ])

  if (!init || !state) {
    error('contract does not exist')
  }

  if (state.id !== 'udc:escrow:1') {
    error(`'${toBech32Address(escrow)}' is not an escrow contract`)
  }

  console.log('Init:', JSON.stringify(init, null, 2))
  console.log('State:', JSON.stringify(state, null, 2))

  process.exit()
}
