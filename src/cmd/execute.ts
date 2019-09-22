import {toBech32Address} from '@zilliqa-js/crypto'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import registryOptions from '../builder/registryOptions'
import zilliqaOptions from '../builder/zilliqaOptions'
import cli from '../cli'
import domainPreflight from '../middleware/domainPreflight'
import escrowPreflight from '../middleware/escrowPreflight'
import zilliqaPreflight from '../middleware/zilliqaPreflight'
import ask from '../util/ask'
import createTransaction from '../util/createTransaction'
import error from '../util/error'

export const command = 'execute <escrow> [domain]'
export const desc = 'Execute swap'

export const builder = (yargs: typeof cli) =>
  yargs
    .positional('escrow', {
      type: 'string',
      describe: 'Escrow contract address',
    })
    .positional('domain', {
      type: 'string',
      describe: 'domain to sell',
    })
    .demandOption('escrow')
    .options(zilliqaOptions)
    .demandOption('private-key')
    .options(registryOptions)
    .middleware([zilliqaPreflight(true), domainPreflight, escrowPreflight])

export const handler = async ({
  domain,
  verbose,
  registry,
  node,
  version,
  zilliqa,
  address,
  escrow,
}: {
  privateKey: string
  domain: string
  verbose: boolean
  url: string
  chainId: number
  registry: string
  node: string
  version: number
  zilliqa: Zilliqa
  address: string
  escrow: string
}) => {
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

  if (init.registry !== registry) {
    error(`'${domain}' on a different registry`)
  }

  if (state.sold.constructor === 'True') {
    error(`'${domain}' already sold`)
  }

  if (state.deposit.constructor === 'False') {
    error(`no ZIL deposited on '${domain}'`)
  }

  if (node && init.escrowedNode !== node) {
    error("wrong escrow contract, domains don't match")
  }

  const strPrice = (init.price / 10 ** 12).toFixed(4)
  console.log(
    `Buying ${domain} from ${toBech32Address(init.seller)} for ${
      strPrice === '0.0000' ? '~0' : strPrice
    } ZIL...`,
  )

  await ask('Continue?')

  if (init.buyer !== address) {
    await ask(`You are buying on behalf of ${init.buyer}. Still Continue?`)
  }

  await createTransaction(zilliqa, {
    version,
    gasLimit: 5000,
    toAddr: escrow,
    data: {_tag: 'execute', params: []},
  })

  process.exit()
}
