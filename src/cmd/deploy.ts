import {toBech32Address} from '@zilliqa-js/crypto'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import {readFileSync} from 'fs'
import {join} from 'path'
import registryOptions from '../builder/registryOptions'
import zilliqaOptions from '../builder/zilliqaOptions'
import cli from '../cli'
import deployPreflight from '../middleware/deployPreflight'
import domainPreflight from '../middleware/domainPreflight'
import zilliqaPreflight from '../middleware/zilliqaPreflight'
import ask from '../util/ask'
import createTransaction from '../util/createTransaction'
import error from '../util/error'

export const command = 'deploy <domain>'
export const desc = 'Deploy an escrow contract'

export const builder = (yargs: typeof cli) =>
  yargs
    .positional('domain', {
      type: 'string',
      describe: 'domain to sell',
    })
    .options(zilliqaOptions)
    .demandOption('private-key')
    .options(registryOptions)
    .demandOption('registry')
    .options({
      buyer: {
        type: 'string',
        description: 'Buyer address',
      },
      price: {
        type: 'number',
        description: 'Price to sell at',
      },
      qa: {
        type: 'boolean',
        description: 'Use Qa instead of Zillings for price',
      },
      seller: {
        type: 'string',
        description: 'Seller address',
      },
    })
    .demandOption(['buyer', 'price'])
    .middleware([zilliqaPreflight(true), domainPreflight, deployPreflight])

export const handler = async ({
  domain,
  verbose,
  registry,
  node,
  buyer,
  price,
  seller,
  version,
  zilliqa,
  address,
}: {
  privateKey: string
  domain: string
  verbose: boolean
  url: string
  chainId: number
  registry: string
  node: string
  buyer: string
  price: number
  seller: string
  version: number
  zilliqa: Zilliqa
  address: string
}) => {
  if (seller === buyer) {
    error('cannot sell to seller')
  }

  const init = [
    {vname: '_scilla_version', type: 'Uint32', value: '0'},
    {vname: 'registry', type: 'ByStr20', value: registry},
    {vname: 'seller', type: 'ByStr20', value: seller},
    {vname: 'buyer', type: 'ByStr20', value: buyer},
    {vname: 'escrowedNode', type: 'ByStr32', value: node},
    {vname: 'price', type: 'Uint128', value: price.toString()},
  ]

  const strPrice = (price / 10 ** 12).toFixed(4)
  console.log(
    `Selling ${domain} to ${toBech32Address(buyer)} for ${
      strPrice === '0.0000' ? '~0' : strPrice
    } ZIL...`,
  )

  await ask('Continue?')

  if (seller !== address) {
    await ask(`You are selling on behalf of ${seller}. Still Continue?`)
  }

  const tx = await createTransaction(zilliqa, {
    version,
    gasLimit: 3500,
    code: readFileSync(
      join(__dirname, '../../contracts/escrow.scilla'),
      'utf8',
    ),
    data: init,
  })

  process.exit()
}
